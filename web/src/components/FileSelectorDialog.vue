<template>
    <teleport to="body">
        <transition name="settings-mask-fade">
            <div v-if="visible" class="file-selector-mask" @click="close" />
        </transition>

        <transition name="settings-slide">
            <div v-if="visible" class="file-selector-dialog">
                <div class="file-selector-header">
                    <div>
                        <h3 class="file-selector-title">
                            <i class="fas fa-folder-open file-selector-title-icon" aria-hidden="true"></i>
                            <span>{{ t('fileSelector.title') }}</span>
                        </h3>
                        <p class="file-selector-subtitle">{{ t('fileSelector.subtitle') }}</p>
                    </div>
                    <button class="file-selector-close" type="button" :aria-label="t('common.close')" @click="close">
                        <i class="fas fa-xmark" aria-hidden="true"></i>
                    </button>
                </div>

                <div class="file-selector-path">
                    <button class="path-nav-button" type="button" @click="navigateUp" :disabled="!canGoUp">
                        <i class="fas fa-arrow-up" aria-hidden="true"></i>
                    </button>
                    <div class="path-display">{{ currentPath }}</div>
                    <button class="path-nav-button" type="button" @click="refresh">
                        <i class="fas fa-sync-alt" aria-hidden="true"></i>
                    </button>
                </div>

                <div class="file-selector-content">
                    <div v-if="loading" class="file-selector-loading">
                        <i class="fas fa-spinner fa-spin" aria-hidden="true"></i>
                        <span>{{ t('fileSelector.loading') }}</span>
                    </div>
                    <div v-else-if="error" class="file-selector-error">
                        <i class="fas fa-exclamation-triangle" aria-hidden="true"></i>
                        <span>{{ error }}</span>
                    </div>
                    <div v-else class="file-tree">
                        <div
                            v-for="item in fileItems"
                            :key="item.path"
                            class="file-tree-item"
                            :class="{
                                selected: selectedPath === item.path,
                                directory: item.type === 'directory',
                            }"
                            @click="handleItemClick(item)"
                        >
                            <i
                                v-if="item.type === 'directory'"
                                class="file-tree-icon"
                                :class="expandedDirs.has(item.path) ? 'fas fa-folder-open' : 'fas fa-folder'"
                                aria-hidden="true"
                            ></i>
                            <i v-else class="file-tree-icon fas fa-file" aria-hidden="true"></i>
                            <span class="file-tree-name">{{ item.name }}</span>
                            <i v-if="item.type === 'directory' && item.children && item.children.length > 0"
                               class="file-tree-expand"
                               :class="expandedDirs.has(item.path) ? 'fas fa-chevron-down' : 'fas fa-chevron-right'"
                               aria-hidden="true"
                            ></i>
                        </div>
                        <div v-if="fileItems.length === 0" class="file-selector-empty">
                            <i class="fas fa-inbox" aria-hidden="true"></i>
                            <span>{{ t('fileSelector.empty') }}</span>
                        </div>
                    </div>
                </div>

                <div class="file-selector-footer">
                    <button class="secondary-button" type="button" @click="close">
                        {{ t('common.cancel') }}
                    </button>
                    <button class="primary-button" type="button" @click="confirmSelection" :disabled="!selectedPath">
                        <i class="fas fa-check" aria-hidden="true"></i>
                        {{ t('fileSelector.confirm') }}
                    </button>
                </div>
            </div>
        </transition>
    </teleport>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { getAuthHeaders } from '../services/auth'
import { API_CONFIG } from '../config/api'

const { t } = useI18n()

interface FileSystemItem {
    name: string
    path: string
    type: 'file' | 'directory'
    size?: number
    children?: FileSystemItem[]
}

interface Props {
    visible: boolean
    initialPath?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void
    (e: 'select', path: string): void
}>()

const loading = ref(false)
const error = ref<string | null>(null)
const fileItems = ref<FileSystemItem[]>([])
const currentPath = ref('')
const selectedPath = ref('')
const expandedDirs = ref<Set<string>>(new Set())
const pathHistory = ref<string[]>([])

const canGoUp = computed(() => pathHistory.value.length > 0)

function navigateUp() {
    if (pathHistory.value.length > 0) {
        pathHistory.value.pop()
    }
    if (pathHistory.value.length === 0) {
        const defaultPath = getDefaultPath()
        loadDirectory(defaultPath, false)
    } else {
        const parentPath = pathHistory.value[pathHistory.value.length - 1]
        loadDirectory(parentPath, false)
    }
}

function refresh() {
    loadDirectory(currentPath.value, false)
}

function getDefaultPath(): string {
    // 尝试获取系统默认路径
    if (import.meta.env.VITE_DEFAULT_PATH) {
        return import.meta.env.VITE_DEFAULT_PATH
    }
    // 或者使用空字符串让后端返回当前工作目录
    return ''
}

async function loadDirectory(dirPath: string, addToHistory: boolean = true) {
    loading.value = true
    error.value = null

    try {
        const headers = await getAuthHeaders()
        const params = new URLSearchParams()
        if (dirPath) {
            params.append('path', dirPath)
        }
        params.append('recursive', 'false')

        const response = await fetch(`${API_CONFIG.baseUrl}/filesystem/list?${params.toString()}`, {
            method: 'GET',
            headers,
        })

        if (response.ok) {
            const result = await response.json()
            if (result.success) {
                fileItems.value = result.items
                currentPath.value = result.path

                if (addToHistory) {
                    pathHistory.value.push(result.path)
                }

                // 默认展开第一层
                expandedDirs.value = new Set()
            } else {
                error.value = result.message || t('fileSelector.error')
            }
        } else {
            error.value = t('fileSelector.error')
        }
    } catch (err) {
        console.error('Failed to load directory:', err)
        error.value = t('fileSelector.error')
    } finally {
        loading.value = false
    }
}

function handleItemClick(item: FileSystemItem) {
    if (item.type === 'directory') {
        if (expandedDirs.value.has(item.path)) {
            // 已经展开，点击进入该目录
            loadDirectory(item.path)
        } else {
            // 未展开，先加载子节点
            expandedDirs.value.add(item.path)
            loadChildren(item)
        }
    }
    // 不管是文件还是目录，都可以被选中
    selectedPath.value = item.path
}

async function loadChildren(item: FileSystemItem) {
    try {
        const headers = await getAuthHeaders()
        const params = new URLSearchParams()
        params.append('path', item.path)
        params.append('recursive', 'false')

        const response = await fetch(`${API_CONFIG.baseUrl}/filesystem/list?${params.toString()}`, {
            method: 'GET',
            headers,
        })

        if (response.ok) {
            const result = await response.json()
            if (result.success) {
                // 更新item的children
                const findAndUpdate = (items: FileSystemItem[]) => {
                    for (const i of items) {
                        if (i.path === item.path) {
                            i.children = result.items
                            return true
                        }
                        if (i.children && findAndUpdate(i.children)) {
                            return true
                        }
                    }
                    return false
                }
                findAndUpdate(fileItems.value)
            }
        }
    } catch (err) {
        console.error('Failed to load children:', err)
    }
}

function close() {
    emit('update:visible', false)
    // 重置状态
    fileItems.value = []
    currentPath.value = ''
    selectedPath.value = ''
    expandedDirs.value = new Set()
    pathHistory.value = []
    error.value = null
}

function confirmSelection() {
    if (selectedPath.value) {
        emit('select', selectedPath.value)
        close()
    }
}

watch(() => props.visible, async (visible) => {
    if (visible) {
        const initialPath = props.initialPath || getDefaultPath()
        loadDirectory(initialPath, false)
    }
})
</script>

<style scoped>
.file-selector-mask {
    position: fixed;
    inset: 0;
    z-index: 10002;
    background: rgba(15, 23, 42, 0.36);
    backdrop-filter: blur(2px);
}

:global(html[data-theme='dark']) .file-selector-mask,
:global(html.dark) .file-selector-mask {
    background: rgba(0, 0, 0, 0.56);
}

.file-selector-dialog {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 10003;
    width: 600px;
    max-width: 90vw;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    background: var(--panel-bg);
    color: var(--text-primary);
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(15, 23, 42, 0.3);
    overflow: hidden;
}

:global(html[data-theme='dark']) .file-selector-dialog,
:global(html.dark) .file-selector-dialog {
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
}

.file-selector-header {
    flex-shrink: 0;
    min-height: 72px;
    padding: 16px 20px 12px;
    box-sizing: border-box;
    border-bottom: 1px solid var(--border-gray);
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    background: var(--panel-bg);
}

.file-selector-title {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 10px;
}

.file-selector-title-icon {
    width: 1em;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--primary);
}

.file-selector-subtitle {
    margin: 4px 0 0;
    font-size: 12px;
    color: var(--text-muted);
}

.file-selector-close {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: var(--text-secondary);
    font-size: 18px;
    line-height: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.file-selector-close:hover {
    background: var(--bg-gray);
    color: var(--text-primary);
}

.file-selector-path {
    flex-shrink: 0;
    padding: 12px 20px;
    box-sizing: border-box;
    border-bottom: 1px solid var(--border-gray);
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--panel-bg);
}

.path-nav-button {
    width: 36px;
    height: 36px;
    border: 1px solid var(--border-gray);
    border-radius: 8px;
    background: var(--panel-bg);
    color: var(--text-secondary);
    font-size: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.path-nav-button:hover:not(:disabled) {
    border-color: var(--primary);
    color: var(--primary);
}

.path-nav-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.path-display {
    flex: 1;
    padding: 8px 12px;
    background: var(--bg-gray);
    border: 1px solid var(--border-gray);
    border-radius: 8px;
    font-size: 13px;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.file-selector-content {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 12px 20px;
    box-sizing: border-box;
    background: var(--panel-bg);
}

.file-selector-loading,
.file-selector-error,
.file-selector-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    color: var(--text-muted);
    gap: 10px;
    font-size: 14px;
}

.file-selector-error {
    color: var(--danger);
}

.file-tree {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.file-tree-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    border-radius: 10px;
    cursor: pointer;
    transition: background 0.2s ease;
}

.file-tree-item:hover {
    background: var(--bg-gray);
}

.file-tree-item.selected {
    background: var(--primary);
    color: var(--text-inverse);
}

.file-tree-icon {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--primary);
    flex-shrink: 0;
}

.file-tree-item.selected .file-tree-icon {
    color: var(--text-inverse);
}

.file-tree-item.directory .file-tree-icon {
    color: var(--primary);
}

.file-tree-item.selected.directory .file-tree-icon {
    color: var(--text-inverse);
}

.file-tree-name {
    flex: 1;
    font-size: 14px;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.file-tree-item.selected .file-tree-name {
    color: var(--text-inverse);
}

.file-tree-expand {
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: var(--text-muted);
    flex-shrink: 0;
}

.file-tree-item.selected .file-tree-expand {
    color: var(--text-inverse);
}

.file-selector-footer {
    flex-shrink: 0;
    min-height: 64px;
    padding: 12px 20px 16px;
    box-sizing: border-box;
    border-top: 1px solid var(--border-gray);
    background: var(--footer-bg);
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

.primary-button,
.secondary-button {
    height: 40px;
    padding: 0 20px;
    border-radius: 9px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s ease;
}

.primary-button {
    border: none;
    color: var(--text-inverse);
    background: var(--primary);
}

.primary-button:hover:not(:disabled) {
    background: var(--primary-hover);
}

.primary-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.secondary-button {
    border: 1px solid var(--border-gray);
    color: var(--text-secondary);
    background: var(--panel-bg);
}

.secondary-button:hover {
    border-color: var(--primary);
    color: var(--primary);
}

.settings-mask-fade-enter-active,
.settings-mask-fade-leave-active {
    transition: opacity 0.2s ease;
}

.settings-mask-fade-enter-from,
.settings-mask-fade-leave-to {
    opacity: 0;
}

.settings-slide-enter-active,
.settings-slide-leave-active {
    transition: all 0.25s ease;
}

.settings-slide-enter-from,
.settings-slide-leave-to {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.95);
}

@media (max-width: 768px) {
    .file-selector-dialog {
        width: calc(100% - 32px);
        max-width: 480px;
        max-height: 80vh;
        border-radius: 16px;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }

    .settings-slide-enter-from,
    .settings-slide-leave-to {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.95);
    }

    .file-selector-header {
        padding: 14px 16px 10px;
    }

    .file-selector-content {
        padding: 10px 16px;
    }

    .file-selector-footer {
        padding: 10px 16px 14px;
    }
}
</style>