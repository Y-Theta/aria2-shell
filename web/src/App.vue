<template>
    <div class="app-layout">
        <sidebar ref="sidebarRef" @menu-change="handleMenuChange" />

        <div class="main-content">
            <div v-if="connectionStatus === 'checking'" class="connection-page">
                <div class="connection-panel">
                    <div class="loading-spinner"></div>
                    <div class="connection-title">{{ t('connection.checkingTitle') }}</div>
                    <div class="connection-desc">{{ t('connection.checkingDesc') }}</div>
                </div>
            </div>

            <div v-else-if="connectionStatus === 'failed'" class="connection-page">
                <div class="connection-panel">
                    <div class="error-icon">!</div>
                    <div class="connection-title">{{ t('connection.failedTitle') }}</div>
                    <div class="connection-desc">{{ t('connection.failedDesc') }}</div>
                    <button class="retry-button" @click="checkBackendConnection">
                        {{ t('connection.retry') }}
                    </button>
                </div>
            </div>

            <template v-else>
                <top-bar @search="handleSearch" />

                <div class="content-area">
                    <task-list :tasks="filteredTasks" @play="handlePlay" @pause="handlePause" @delete="handleDelete" />
                </div>

                <bottom-stats :stats="stats" />
            </template>
        </div>
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

let timer: ReturnType<typeof setInterval> | null = null

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
    await checkBackendConnection()
})

onUnmounted(() => {
    window.removeEventListener('menu-change', handleWindowMenuChange)

    if (timer) {
        clearInterval(timer)
        timer = null
    }
})

const checkBackendConnection = async () => {
    connectionStatus.value = 'checking'

    try {
        var version = await apiClient.checkConnection()
        if (version != null) {
            connectionStatus.value = 'connected'

            await loadData()

            if (!timer) {
                timer = setInterval(loadData, 5000)
            }
        }
    } catch (error) {
        console.error('Failed to connect backend:', error)
        connectionStatus.value = 'failed'

        if (timer) {
            clearInterval(timer)
            timer = null
        }
    }
}

const loadData = async () => {
    try {
        tasks.value = await apiClient.getTasks()
        stats.value = await apiClient.getStats()
    } catch (error) {
        console.error('Failed to load data:', error)
        connectionStatus.value = 'failed'

        if (timer) {
            clearInterval(timer)
            timer = null
        }
    }
}

const handleWindowMenuChange = (event: Event) => {
    const customEvent = event as CustomEvent
    currentMenu.value = customEvent.detail?.menu || 'active'
}

const handleMenuChange = (event: any) => {
    currentMenu.value = event.detail?.menu || 'active'
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

/* 连接中 / 失败界面：铺满整个右侧 */
.connection-page {
    flex: 1;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: stretch;
    justify-content: stretch;
    background-color: #f5f5f5;
}

/* 让内容区域撑满 */
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

/* 图标更大一点 */
.loading-spinner {
    width: 64px;
    height: 64px;
    border: 6px solid #e5e7eb;
    border-top-color: #409eff;
    border-radius: 50%;
    animation: spin 0.9s linear infinite;
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

/* 主内容区域占满剩余空间 */
.content-area {
    flex: 1;
    width: 100%;
    overflow-y: auto;
    padding: 24px;
    box-sizing: border-box;
}
</style>