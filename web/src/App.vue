<template>
    <div class="app-layout">
        <sidebar ref="sidebarRef" @menu-change="handleMenuChange" />

        <div class="main-content">
            <!-- 连接中 -->
            <div v-if="connectionStatus === 'checking'" class="connection-page">
                <div class="connection-panel">
                    <div class="spinner-wrapper">
                        <svg class="spinner" viewBox="0 0 50 50">
                            <circle class="spinner-path" cx="25" cy="25" r="20" fill="none" stroke-width="5" />
                        </svg>
                    </div>
                    <div class="connection-title">{{ t('connection.checkingTitle') }}</div>
                    <div class="connection-desc">{{ t('connection.checkingDesc') }}</div>
                </div>
            </div>

            <!-- 连接失败 -->
            <div v-else-if="connectionStatus === 'failed'" class="connection-page">
                <div class="connection-panel">
                    <div class="error-icon">!</div>
                    <div class="connection-title">{{ t('connection.failedTitle') }}</div>
                    <div class="connection-desc">{{ t('connection.failedDesc') }}</div>

                    <button class="retry-button" @click="retryAll">
                        {{ t('connection.retry') }}
                    </button>
                </div>
            </div>

            <!-- 正常内容 -->
            <template v-else>
                <top-bar @search="handleSearch" />

                <div class="content-area">
                    <task-list :tasks="filteredTasks" @play="handlePlay" @pause="handlePause" @delete="handleDelete" />
                </div>

                <bottom-stats :stats="stats" />
            </template>
        </div>

        <button class="floating-settings-button" type="button" :aria-label="t('settings.title') || '设置'"
            @click="showSettings = true">
            <span class="floating-settings-icon-wrap">
                <i class="fas fa-gear floating-settings-icon" aria-hidden="true"></i>
            </span>
        </button>

        <!-- 设置面板 -->
        <settings-panel v-model:visible="showSettings" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Task, Stats } from './types'
import Sidebar from './components/Sidebar.vue'
import TopBar from './components/TopBar.vue'
import TaskList from './components/TaskList.vue'
import BottomStats from './components/BottomStats.vue'
import SettingsPanel from './components/SettingsPanel.vue'
import apiClient from './api/client'

type ConnectionStatus = 'checking' | 'connected' | 'failed'

const { t } = useI18n()

const tasks = ref<Task[]>([])
const stats = ref<Stats>({
    totalDownloadSpeed: 0,
    totalUploadSpeed: 0,
    activeTasks: 0,
    completedTasks: 0,
    pausedTasks: 0,
})

const currentMenu = ref('active')
const searchQuery = ref('')
const connectionStatus = ref<ConnectionStatus>('checking')
const showSettings = ref(false)

let timer: ReturnType<typeof setInterval> | null = null
let retrying = false

const RETRY_COUNT = 3
const RETRY_DELAY = 5000

const filteredTasks = computed(() => {
    let result = tasks.value

    if (currentMenu.value === 'completed') {
        result = result.filter(t => t.status === 'completed')
    } else if (currentMenu.value === 'paused') {
        result = result.filter(t => t.status === 'paused')
    } else if (currentMenu.value === 'torrents') {
        result = result.filter(t => t.filename.endsWith('.torrent'))
    } else if (currentMenu.value === 'active') {
        result = result.filter(t => t.status === 'downloading' || t.status === 'seeding')
    }

    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(t => t.filename.toLowerCase().includes(query))
    }

    return result
})

onMounted(async () => {
    window.addEventListener('menu-change', handleWindowMenuChange)
    await retryAll()
})

onUnmounted(() => {
    window.removeEventListener('menu-change', handleWindowMenuChange)

    if (timer) {
        clearInterval(timer)
        timer = null
    }
})

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const checkBackendConnectionWithRetry = async () => {
    let lastError: unknown

    for (let i = 1; i <= RETRY_COUNT; i++) {
        try {
            await apiClient.checkConnection()
            return
        } catch (error) {
            lastError = error
            console.error(`Backend connection attempt ${i} failed:`, error)

            if (i < RETRY_COUNT) {
                await wait(RETRY_DELAY)
            }
        }
    }

    throw lastError
}

const loadDataWithRetry = async () => {
    let lastError: unknown

    for (let i = 1; i <= RETRY_COUNT; i++) {
        try {
            const [taskList, statData] = await Promise.all([
                apiClient.getTasks(),
                apiClient.getStats(),
            ])

            tasks.value = taskList
            stats.value = statData
            return
        } catch (error) {
            lastError = error
            console.error(`Load data attempt ${i} failed:`, error)

            if (i < RETRY_COUNT) {
                await wait(RETRY_DELAY)
            }
        }
    }

    throw lastError
}

const retryAll = async () => {
    if (retrying) return
    retrying = true
    connectionStatus.value = 'checking'

    try {
        if (timer) {
            clearInterval(timer)
            timer = null
        }

        await checkBackendConnectionWithRetry()
        await loadDataWithRetry()

        connectionStatus.value = 'connected'

        if (!timer) {
            timer = setInterval(async () => {
                try {
                    await loadDataWithRetry()
                } catch (error) {
                    console.error('Periodic load failed:', error)
                    connectionStatus.value = 'failed'
                    if (timer) {
                        clearInterval(timer)
                        timer = null
                    }
                }
            }, 5000)
        }
    } catch (error) {
        console.error('Connection flow failed:', error)
        connectionStatus.value = 'failed'
    } finally {
        retrying = false
    }
}

const openMenu = (menu: string) => {
    if (menu === 'settings') {
        showSettings.value = true
        return
    }

    currentMenu.value = menu
}

const handleWindowMenuChange = (event: Event) => {
    const customEvent = event as CustomEvent
    openMenu(customEvent.detail?.menu || 'active')
}

const handleMenuChange = (event: any) => {
    openMenu(event.detail?.menu || 'active')
}

const handleSearch = (query: string) => {
    searchQuery.value = query
}

const handlePlay = async (id: string) => {
    try {
        await apiClient.resumeTask(id)
        const task = tasks.value.find(t => t.id === id)
        if (task) task.status = 'downloading'
    } catch (error) {
        console.error('Failed to resume task:', error)
    }
}

const handlePause = async (id: string) => {
    try {
        await apiClient.pauseTask(id)
        const task = tasks.value.find(t => t.id === id)
        if (task) task.status = 'paused'
    } catch (error) {
        console.error('Failed to pause task:', error)
    }
}

const handleDelete = async (id: string) => {
    try {
        await apiClient.deleteTask(id)
        tasks.value = tasks.value.filter(t => t.id !== id)
    } catch (error) {
        console.error('Failed to delete task:', error)
    }
}
</script>
<style scoped>
.app-layout {
    display: flex;
    height: 100vh;
    width: 100%;
    background-color: #f5f5f5;
}

.main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    width: 100%;
    height: 100vh;
    overflow: hidden;
}

.connection-page {
    flex: 1;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
}

.connection-panel {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    background: linear-gradient(180deg, #ffffff 0%, #f8faff 100%);
}

.spinner-wrapper {
    width: 72px;
    height: 72px;
}

.spinner {
    width: 72px;
    height: 72px;
    animation: rotate 1s linear infinite;
}

.spinner-path {
    stroke: #409eff;
    stroke-linecap: round;
    animation: dash 1.5s ease-in-out infinite;
}

.connection-title {
    font-size: 24px;
    font-weight: 600;
    color: #303133;
}

.connection-desc {
    font-size: 16px;
    color: #909399;
    text-align: center;
    line-height: 1.8;
    max-width: 520px;
    padding: 0 24px;
}

.error-icon {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background-color: #f56c6c;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 34px;
    font-weight: 700;
}

.retry-button {
    margin-top: 8px;
    height: 40px;
    padding: 0 28px;
    border: none;
    border-radius: 8px;
    background-color: #409eff;
    color: #ffffff;
    font-size: 15px;
    cursor: pointer;
}

.retry-button:hover {
    background-color: #66b1ff;
}

.content-area {
    flex: 1;
    width: 100%;
    overflow-y: auto;
    padding: 24px;
    box-sizing: border-box;
}

.floating-settings-button {
    position: fixed;
    right: 28px;
    bottom: 28px;
    z-index: 1200;
    width: 56px;
    height: 56px;
    border: none;
    border-radius: 50%;
    background: linear-gradient(135deg, #409eff, #66b1ff);
    color: #ffffff;
    box-shadow: 0 10px 24px rgba(64, 158, 255, 0.36);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition:
        transform 0.2s ease,
        box-shadow 0.2s ease,
        background 0.2s ease;
}

.floating-settings-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 14px 30px rgba(64, 158, 255, 0.44);
    background: linear-gradient(135deg, #337ecc, #409eff);
}

.floating-settings-icon-wrap {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform-origin: center center;
  transition: transform 0.25s ease;
  will-change: transform;
}

.floating-settings-icon {
  font-size: 24px;
  line-height: 1;
  display: block;
}

.floating-settings-button:hover .floating-settings-icon-wrap {
  transform: rotate(45deg);
}

/* 移动端保持现状：隐藏桌面悬浮设置按钮 */
@media (max-width: 768px) {
    .floating-settings-button {
        display: none;
    }
}

@keyframes rotate {
    100% {
        transform: rotate(360deg);
    }
}

@keyframes dash {
    0% {
        stroke-dasharray: 1, 150;
        stroke-dashoffset: 0;
    }

    50% {
        stroke-dasharray: 90, 150;
        stroke-dashoffset: -35;
    }

    100% {
        stroke-dasharray: 90, 150;
        stroke-dashoffset: -124;
    }
}
</style>