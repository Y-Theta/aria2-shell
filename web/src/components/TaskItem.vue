<template>
    <div class="task-item" :class="{ expanded: isExpanded, selected: isSelected }">
        <div v-if="tooltipVisible" class="task-tooltip" :style="tooltipStyle">{{ task.name }}</div>
        <div class="task-main" @click="handleMainClick">
            <!-- 桌面端布局 -->
            <div class="desktop-layout">
                <div v-if="isBatchMode" class="task-cell checkbox-cell">
                    <input type="checkbox" :checked="isSelected" @click.stop @change="handleToggleSelect" />
                </div>
                <div class="task-cell info-cell" :style="getColumnStyle('info')">
                    <div class="task-info">
                        <div class="task-icon">
                            <i :class="iconClass"></i>
                        </div>
                        <div class="task-details">
                            <div class="task-name" @mouseenter="showTooltip($event)" @mouseleave="hideTooltip"
                                ref="taskNameDesktop">
                                <span class="task-name-text">{{ task.name }}</span>
                                <span v-if="task.isTorrent" class="torrent-badge">
                                    <i class="fas fa-magnet"></i>
                                </span>
                            </div>
                            <div class="task-meta">
                                <span class="task-size">{{ formatSize(task.totalSize) }}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <template v-for="column in columnOrder" :key="column.id">
                    <div class="task-cell" :style="getColumnStyle(column.id)">
                        <template v-if="column.id === 'size'">
                            <span class="size-text">{{ formatSize(task.totalSize) }}</span>
                        </template>
                        <template v-else-if="column.id === 'progress'">
                            <task-progress-bar :progress="task.progress" :status="task.status" />
                        </template>
                        <template v-else-if="column.id === 'speed'">
                            <span v-if="task.status === 'downloading' || task.status === 'seeding'" class="speed-text">
                                {{ formatSpeed(task.downloadSpeed) }}
                            </span>
                            <span v-else class="speed-placeholder">-</span>
                        </template>
                        <template v-else-if="column.id === 'status'">
                            <span :class="['status-badge', `status-${task.status}`]">
                                {{ getStatusText(task.status) }}
                            </span>
                        </template>
                        <template v-else-if="column.id === 'actions'">
                            <div class="task-actions" @click.stop>
                                <button v-if="task.status === 'paused'" class="action-btn"
                                    @click="$emit('start', task.id)" :title="t('taskPage.start')">
                                    <i class="fas fa-play"></i>
                                </button>
                                <button v-else-if="task.status === 'downloading'" class="action-btn"
                                    @click="$emit('pause', task.id)" :title="t('taskPage.pause')">
                                    <i class="fas fa-pause"></i>
                                </button>
                                <button class="action-btn action-btn-danger" @click="$emit('delete', task.id)"
                                    :title="t('taskPage.delete')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </template>
                    </div>
                </template>
            </div>

            <!-- 移动端布局 -->
            <div class="mobile-layout">
                <div class="mobile-top">
                    <div v-if="isBatchMode" class="task-cell checkbox-cell">
                        <input type="checkbox" :checked="isSelected" @click.stop @change="handleToggleSelect" />
                    </div>
                    <div class="task-info">
                        <div class="task-details">
                            <div class="task-name" @mouseenter="showTooltip($event)" @mouseleave="hideTooltip"
                                ref="taskNameMobile">
                                <span class="task-name-text">{{ task.name }}</span>
                                <span v-if="task.isTorrent" class="torrent-badge">
                                    <i class="fas fa-magnet"></i>
                                </span>
                            </div>
                            <div class="task-meta">
                                <span class="task-size">{{ formatSize(task.totalSize) }}</span>
                                <span v-if="task.status === 'downloading' || task.status === 'seeding'"
                                    class="task-speed">
                                    {{ formatSpeed(task.downloadSpeed) }}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="task-actions" @click.stop>
                        <button v-if="task.status === 'paused'" class="action-btn" @click="$emit('start', task.id)"
                            :title="t('taskPage.start')">
                            <i class="fas fa-play"></i>
                        </button>
                        <button v-else-if="task.status === 'downloading'" class="action-btn"
                            @click="$emit('pause', task.id)" :title="t('taskPage.pause')">
                            <i class="fas fa-pause"></i> </button>
                        <button class="action-btn action-btn-danger" @click="$emit('delete', task.id)"
                            :title="t('taskPage.delete')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="mobile-bottom">
                    <task-progress-bar :progress="task.progress" :status="task.status" />
                </div>
            </div>
        </div>

        <div v-if="isExpanded" class="task-expanded">
            <div v-if="task.isTorrent && task.files && task.files.length > 0" class="torrent-files">
                <div class="files-header">
                    <span class="files-title">{{ t('taskPage.torrentFileList') }} ({{ task.files.length }})</span>
                </div>
                <div class="files-list">
                    <div v-for="file in task.files" :key="file.id" class="file-item">
                        <div class="file-progress-bg" :style="{ width: file.progress + '%' }"></div>
                        <div class="file-content">
                            <div class="file-info">
                                <i :class="getFileIcon(file.name)" class="file-icon"></i>
                                <span class="file-name">{{ file.name }}</span>
                            </div>
                            <div class="file-details">
                                <span class="file-speed">{{ formatSpeed(0) }}</span>
                                <span class="file-size">{{ formatSize(file.size) }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else class="expanded-row">
                <div class="expanded-item">
                    <span class="label">{{ t('taskPage.downloadSpeed') }}:</span>
                    <span class="value">{{ formatSpeed(task.downloadSpeed) }}</span>
                </div>
                <div class="expanded-item">
                    <span class="label">{{ t('taskPage.uploadSpeed') }}:</span>
                    <span class="value">{{ formatSpeed(task.uploadSpeed) }}</span>
                </div>
                <div class="expanded-item">
                    <span class="label">{{ t('taskPage.progress') }}:</span>
                    <span class="value">{{ task.progress }}%</span>
                </div>
            </div>
            <div class="expanded-row" v-if="task.path">
                <div class="expanded-item full-width expanded-path">
                    <span class="label">{{ t('settings.general.downloadPath.desc') }}:</span>
                    <span class="value">{{ task.path }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import TaskProgressBar from './TaskProgressBar.vue'

interface TorrentFile {
    id: string
    name: string
    size: number
    progress: number
    priority: 'high' | 'normal' | 'low'
}

interface Task {
    id: string
    name: string
    totalSize: number
    progress: number
    downloadSpeed: number
    uploadSpeed: number
    status: 'downloading' | 'completed' | 'paused' | 'error' | 'seeding'
    isTorrent?: boolean
    path?: string
    files?: TorrentFile[]
}

interface Column {
    id: string
    label: string
}

const { t } = useI18n()
const tooltipVisible = ref(false)
const tooltipStyle = ref({})

const showTooltip = (event: MouseEvent) => {
    const target = event.currentTarget as HTMLElement
    const textEl = target.querySelector('.task-name-text') as HTMLElement
    if (textEl && textEl.scrollWidth > textEl.clientWidth) {
        const rect = target.getBoundingClientRect()
        tooltipStyle.value = {
            left: `${rect.left + window.scrollX}px`,
            top: `${rect.top + window.scrollY - 35}px`
        }
        tooltipVisible.value = true
    }
}

const hideTooltip = () => {
    tooltipVisible.value = false
}

const props = defineProps<{
    task: Task
    columnOrder?: Column[]
    columnWidths?: Record<string, number>
    isBatchMode?: boolean
    isSelected?: boolean
    isExpanded?: boolean
}>()

const emit = defineEmits<{
    (e: 'start', id: string): void
    (e: 'pause', id: string): void
    (e: 'delete', id: string): void
    (e: 'openFolder', id: string): void
    (e: 'openFile', id: string): void
    (e: 'toggle-select', id: string): void
    (e: 'toggle-expand', id: string): void
}>()

const getColumnStyle = (columnId: string) => {
    return {
        flex: props.columnWidths ? props.columnWidths[columnId] : getDefaultFlex(columnId),
    }
}

const getDefaultFlex = (columnId: string) => {
    const defaults: Record<string, number> = {
        info: 2,
        size: 1.5,
        progress: 1.5,
        speed: 0.8,
        status: 0.8,
        actions: 1,
    }
    return defaults[columnId] || 1
}

const iconClass = computed(() => {
    if (props.task.isTorrent) return 'fas fa-file-archive'
    const ext = props.task.name.split('.').pop()?.toLowerCase()
    if (['mp4', 'mkv', 'avi', 'mov'].includes(ext || '')) return 'fas fa-video'
    if (['mp3', 'wav', 'flac', 'aac'].includes(ext || '')) return 'fas fa-music'
    if (['pdf', 'doc', 'docx', 'txt'].includes(ext || '')) return 'fas fa-file-alt'
    if (['zip', 'rar', '7z', 'tar'].includes(ext || '')) return 'fas fa-file-archive'
    if (['exe', 'msi', 'dmg', 'app'].includes(ext || '')) return 'fas fa-cog'
    return 'fas fa-file'
})

const toggleExpand = () => {
    emit('toggle-expand', props.task.id)
}

const handleMainClick = () => {
    if (props.isBatchMode) {
        emit('toggle-select', props.task.id)
    } else {
        toggleExpand()
    }
}

const handleToggleSelect = () => {
    emit('toggle-select', props.task.id)
}

const getStatusText = (status: string) => {
    switch (status) {
        case 'downloading':
            return t('taskPage.downloading')
        case 'completed':
            return t('taskPage.completed')
        case 'paused':
            return t('taskPage.paused')
        case 'seeding':
            return t('sidebar.seeding')
        default:
            return status
    }
}

const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    if (['mp4', 'mkv', 'avi', 'mov'].includes(ext || '')) return 'fas fa-video'
    if (['mp3', 'wav', 'flac', 'aac'].includes(ext || '')) return 'fas fa-music'
    if (['pdf', 'doc', 'docx', 'txt'].includes(ext || '')) return 'fas fa-file-alt'
    if (['zip', 'rar', '7z', 'tar'].includes(ext || '')) return 'fas fa-file-archive'
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext || '')) return 'fas fa-image'
    return 'fas fa-file'
}

const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const formatSpeed = (bytesPerSecond: number) => {
    if (bytesPerSecond === 0) return '0 B/s'
    const k = 1024
    const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s']
    const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k))
    return parseFloat((bytesPerSecond / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}
</script>

<style scoped>
.task-item {
    background-color: var(--panel-bg);
    border-radius: var(--radius-md);
    overflow: hidden;
    transition: all 0.2s ease;
    flex-shrink: 0;
    border: 2px solid transparent;
}

.task-item:hover {
    box-shadow: var(--shadow-sm);
}

.task-item.selected {
    border-color: var(--primary-blue);
    box-shadow: 0 0 0 2px rgba(31, 111, 235, 0.2);
}

.task-cell.checkbox-cell {
    flex: 0 0 40px;
    justify-content: center;
    padding: 0;
}

.task-main {
    display: flex;
    align-items: center;
    padding: var(--spacing-lg);
}

/* 桌面端布局样式 */
.desktop-layout {
    display: flex;
    width: 100%;
    align-items: center;
    flex-shrink: 0;
    min-width: 0;
}

.task-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    padding: 0 var(--spacing-md);
    flex-shrink: 1;
    min-width: 0;
    overflow: hidden;
}

.task-cell:last-child {
    border-right: none;
}

.task-cell.info-cell {
    justify-content: flex-start;
    padding-left: 0;
    padding-right: var(--spacing-md);
    flex-shrink: 1;
}

.task-info {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    width: 100%;
}

.task-icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--bg-gray);
    border-radius: var(--radius-md);
    color: var(--primary-blue);
    font-size: 18px;
    flex-shrink: 0;
}

.task-details {
    flex: 1;
    min-width: 0;
}

.task-name {
    font-size: 15px;
    font-weight: 500;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    flex-direction: row;
    gap: var(--spacing-lg);
}

.task-name-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
    flex-grow: 0;
}

.torrent-badge {
    color: var(--success-green);
    font-size: 12px;
}

.task-meta {
    font-size: 13px;
    color: var(--text-muted);
}

.task-meta .task-size {
    display: none;
}

.size-text {
    font-size: 14px;
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
}

.speed-text {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
}

.speed-placeholder {
    font-size: 14px;
    color: var(--text-muted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
}

.status-badge {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 500;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    min-width: 0;
}

.status-downloading,
.status-seeding {
    background-color: rgba(31, 111, 235, 0.1);
    color: var(--primary-blue);
}

.status-completed {
    background-color: rgba(45, 164, 78, 0.1);
    color: var(--success-green);
}

.status-paused {
    background-color: rgba(110, 118, 129, 0.1);
    color: var(--neutral-gray);
}

.status-error {
    background-color: rgba(218, 54, 51, 0.1);
    color: var(--error-red);
}

.task-actions {
    display: flex;
    gap: var(--spacing-xs);
    width: 100%;
    justify-content: flex-end;
}

.action-btn {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-md);
    background: transparent;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s ease;
}

.action-btn:hover {
    background-color: var(--bg-gray);
    color: var(--primary-blue);
}

.action-btn-danger:hover {
    color: var(--error-red);
}

/* 移动端布局 */
.mobile-layout {
    display: none;
}

/* 展开区域样式 */
.task-expanded {
    padding: 0 var(--spacing-lg) var(--spacing-lg);
    border-top: 1px solid var(--border-gray);
}

.torrent-files {
    padding-top: var(--spacing-md);
}

.files-header {
    margin-bottom: var(--spacing-sm);
}

.files-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-secondary);
}

.files-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
}

.file-item {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-sm) var(--spacing-md);
    background-color: var(--bg-gray);
    border-radius: var(--radius-md);
    overflow: hidden;
}

.file-progress-bg {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    background-color: rgba(31, 111, 235, 0.1);
    transition: width 0.3s ease;
    z-index: 1;
}

.file-content {
    position: relative;
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    z-index: 2;
}

.file-info {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    flex: 1;
    min-width: 0;
}

.file-icon {
    color: var(--text-muted);
    font-size: 14px;
    flex-shrink: 0;
}

.file-name {
    font-size: 13px;
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.file-details {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    flex-shrink: 0;
    justify-content: flex-end;
}

.file-size {
    font-size: 12px;
    min-width: 64px;
    color: var(--text-muted);
    text-align: right;
}

.file-speed {
    font-size: 12px;
    min-width: 72px;
    color: var(--text-secondary);
    text-align: right;
}

.expanded-row {
    display: flex;
    gap: var(--spacing-lg);
    padding-top: var(--spacing-md);
    flex-wrap: wrap;
}

.expanded-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
}

.expanded-item.full-width {
    flex: 1;
    min-width: 100%;
}

.expanded-item .label {
    font-size: 13px;
    color: var(--text-muted);
}

.expanded-item .value {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
}

/* 移动端样式 */
@media (max-width: 768px) {
    .desktop-layout {
        display: none;
    }

    .mobile-layout {
        display: flex;
        flex-direction: column;
        width: 100%;
        gap: var(--spacing-md);
    }

    .task-main {
        padding: var(--spacing-md);
    }

    .mobile-top {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: var(--spacing-md);
        width: 100%;
    }

    .task-info {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: var(--spacing-md);
        flex-grow: 1;
    }

    .task-name {
        font-size: 15px;
        line-height: 1.4;
        overflow: hidden;
        text-overflow: ellipsis;
        display: flex;
        flex-direction: row;
        align-items: center;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        word-break: break-word;
    }

    .task-name-text {
        overflow: hidden;
        text-overflow: ellipsis;
        display: block;
        -webkit-line-clamp: 2;
        flex-shrink: 0;
        flex-grow: 0;
        min-width: 0;
        -webkit-box-orient: vertical;
        word-break: break-word;
    }

    .task-cell.checkbox-cell {
        display: none;
    }

    .torrent-badge {
        display: block;
        flex-grow: 1;
        color: var(--success-green);
        font-size: 12px;
    }

    .task-meta .task-size {
        display: inline;
    }

    .task-meta {
        display: flex;
        overflow: hidden;
        text-overflow: ellipsis;
        gap: var(--spacing-lg);
        line-height: 1.4;
        padding-top: 4px;
        font-size: 13px;
    }

    .task-actions {
        display: flex;
        gap: var(--spacing-xs);
        flex-shrink: 0;
        flex-wrap: wrap;
        justify-content: flex-end;
        max-width: 120px;
    }

    .mobile-bottom {
        width: 100%;
    }

    .task-item {
        position: static;
    }

    /* Torrent file items mobile */
    .file-details {
        gap: var(--spacing-sm);
    }

    .priority-badge {
        display: none;
    }

    .expanded-path .label {
        display: none;
    }
}

.task-tooltip {
    position: fixed;
    background-color: #333;
    color: #fff;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 13px;
    max-width: 300px;
    word-wrap: break-word;
    z-index: 1000;
    pointer-events: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.task-tooltip::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #333 transparent transparent transparent;
}
</style>