<template>
    <Teleport to="body">
        <div v-if="tooltipVisible" class="task-tooltip" :style="tooltipStyle">{{ task.name }}</div>
    </Teleport>
    <div class="task-item" :class="{ expanded: isExpanded, selected: isSelected }">
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
                                <button v-if="task.status === 'paused' || task.status === 'error'" class="action-btn"
                                    @click="$emit('start', task.id)" :title="t('taskPage.start')">
                                    <i class="fas fa-play"></i>
                                </button>
                                <button v-else-if="task.status === 'downloading' || task.status === 'waiting' || task.status === 'seeding'" class="action-btn"
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
                        <button v-if="task.status === 'paused' || task.status === 'error'" class="action-btn" @click="$emit('start', task.id)"
                            :title="t('taskPage.start')">
                            <i class="fas fa-play"></i>
                        </button>
                        <button v-else-if="task.status === 'downloading' || task.status === 'waiting' || task.status === 'seeding'" class="action-btn"
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
            <!-- 常规任务详情面板 -->
            <template v-if="!task.isTorrent || !task.files || task.files.length === 0">
                <!-- 顶部统计卡片：5列布局 -->
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-label">{{ t('taskPage.completedSize') }}</div>
                        <div class="stat-value">{{ formatSize(task.completedSize) }}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">{{ t('taskPage.totalSize') }}</div>
                        <div class="stat-value">{{ formatSize(task.totalSize) }}</div>
                    </div>
                    <div class="stat-item stat-item-blue">
                        <div class="stat-label">{{ t('taskPage.downloadSpeed') }}</div>
                        <div class="stat-value">{{ formatSpeed(task.downloadSpeed) }}</div>
                        <div class="stat-indicator stat-indicator-blue"></div>
                    </div>
                    <div class="stat-item stat-item-green">
                        <div class="stat-label">{{ t('taskPage.uploadSpeed') }}</div>
                        <div class="stat-value">{{ formatSpeed(task.uploadSpeed) }}</div>
                        <div class="stat-indicator stat-indicator-green"></div>
                    </div>
                    <div class="stat-item stat-item-orange">
                        <div class="stat-label">{{ t('taskPage.progress') }}</div>
                        <div class="stat-value">{{ task.progress }}%</div>
                        <div class="stat-indicator stat-indicator-orange"></div>
                    </div>
                </div>

                <!-- Bitfield 分片进度条卡片 -->
                <div v-if="task.bitfield && task.progress < 100" class="detail-card bitfield-card">
                    <div class="bitfield-continuous-bar">
                        <!-- 整体进度淡色背景 -->
                        <div class="bitfield-progress-bg" :style="{ width: task.progress + '%' }"></div>
                        <!-- 已下载分片连续高亮填充 -->
                        <template v-for="(segment, index) in downloadedSegments" :key="index">
                            <div 
                                class="filled-segment"
                                :style="{ left: segment.left + '%', width: segment.width + '%' }"
                            ></div>
                        </template>
                    </div>
                </div>

                <!-- 下载路径卡片 -->
                <div v-if="task.path" class="detail-card path-card">
                    <div class="path-value">{{ task.path }}</div>
                </div>
            </template>

            <!-- Torrent 文件列表 -->
            <div v-if="task.isTorrent && task.files && task.files.length > 0" class="torrent-files">
                <!-- Torrent任务也显示统计信息 -->
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-label">{{ t('taskPage.completedSize') }}</div>
                        <div class="stat-value">{{ formatSize(task.completedSize) }}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">{{ t('taskPage.totalSize') }}</div>
                        <div class="stat-value">{{ formatSize(task.totalSize) }}</div>
                    </div>
                    <div class="stat-item stat-item-blue">
                        <div class="stat-label">{{ t('taskPage.downloadSpeed') }}</div>
                        <div class="stat-value">{{ formatSpeed(task.downloadSpeed) }}</div>
                        <div class="stat-indicator stat-indicator-blue"></div>
                    </div>
                    <div class="stat-item stat-item-green">
                        <div class="stat-label">{{ t('taskPage.uploadSpeed') }}</div>
                        <div class="stat-value">{{ formatSpeed(task.uploadSpeed) }}</div>
                        <div class="stat-indicator stat-indicator-green"></div>
                    </div>
                    <div class="stat-item stat-item-orange">
                        <div class="stat-label">{{ t('taskPage.progress') }}</div>
                        <div class="stat-value">{{ task.progress }}%</div>
                        <div class="stat-indicator stat-indicator-orange"></div>
                    </div>
                </div>

                <div v-if="task.bitfield && task.progress < 100" class="detail-card bitfield-card">
                    <div class="bitfield-continuous-bar">
                        <!-- 整体进度淡色背景 -->
                        <div class="bitfield-progress-bg" :style="{ width: task.progress + '%' }"></div>
                        <!-- 已下载分片连续高亮填充 -->
                        <template v-for="(segment, index) in downloadedSegments" :key="index">
                            <div 
                                class="filled-segment"
                                :style="{ left: segment.left + '%', width: segment.width + '%' }"
                            ></div>
                        </template>
                    </div>
                </div>

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

                <div v-if="task.path" class="detail-card path-card">
                    <div class="path-value">{{ task.path }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import TaskProgressBar from './TaskProgressBar.vue'
import type { Task, TorrentFile } from '@common/task'

interface Column {
    id: string
    label: string
}

interface BitfieldSegment {
    downloaded: boolean
    left: number
    width: number
}

interface ContinuousSegment {
    left: number
    width: number
}

const { t } = useI18n()
const tooltipVisible = ref(false)
const tooltipStyle = ref({})

/**
 * 解析bitfield，生成连续已下载分段（用于连续高亮填充）
 * 将连续的已下载bit合并成一个连续区块
 */
const downloadedSegments = computed<ContinuousSegment[]>(() => {
    const { bitfield } = props.task
    if (!bitfield) return []

    // 将十六进制字符串转换为二进制位数组
    const bits: boolean[] = []
    for (let i = 0; i < bitfield.length; i++) {
        const hex = bitfield[i]
        const nibble = parseInt(hex, 16)
        if (isNaN(nibble)) continue
        bits.push(!!(nibble & 0x8))
        bits.push(!!(nibble & 0x4))
        bits.push(!!(nibble & 0x2))
        bits.push(!!(nibble & 0x1))
    }

    if (bits.length === 0) return []

    const segments: ContinuousSegment[] = []
    let currentStart = -1

    for (let i = 0; i < bits.length; i++) {
        if (bits[i]) {
            if (currentStart === -1) {
                // 开始一个新的已下载分段
                currentStart = i
            }
        } else {
            if (currentStart !== -1) {
                // 结束当前已下载分段
                const left = (currentStart / bits.length) * 100
                const width = ((i - currentStart) / bits.length) * 100
                segments.push({ left, width })
                currentStart = -1
            }
        }
    }

    // 处理最后一个分段
    if (currentStart !== -1) {
        const left = (currentStart / bits.length) * 100
        const width = ((bits.length - currentStart) / bits.length) * 100
        segments.push({ left, width })
    }

    return segments
})

const showTooltip = (event: MouseEvent) => {
    const target = event.currentTarget as HTMLElement
    const textEl = target.querySelector('.task-name-text') as HTMLElement
    if (textEl && textEl.scrollWidth > textEl.clientWidth) {
        const rect = target.getBoundingClientRect()
        // position: fixed 使用视口坐标（Teleport 到 body，不受父元素影响）
        let left = rect.left + rect.width / 2
        const top = rect.top - 8
        
        // 边界检查：确保 tooltip 不超出视口左右边界
        const tooltipMaxWidth = 300
        const viewportWidth = window.innerWidth
        const minLeft = tooltipMaxWidth / 2 + 8
        const maxLeft = viewportWidth - tooltipMaxWidth / 2 - 8
        
        if (left < minLeft) {
            left = minLeft
        } else if (left > maxLeft) {
            left = maxLeft
        }
        
        tooltipStyle.value = {
            left: `${left}px`,
            top: `${top}px`,
            transform: 'translate(-50%, -100%)'
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
        case 'waiting':
            return t('taskPage.waiting')
        case 'error':
            return t('taskPage.error')
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
    box-shadow: 0 0 0 2px var(--primary-blue-2);
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
    background-color: var(--primary-blue-10);
    color: var(--primary-blue);
}

.status-completed {
    background-color: var(--success-green-10);
    color: var(--success-green);
}

.status-paused,
.status-waiting {
    background-color: var(--neutral-gray-10);
    color: var(--neutral-gray);
}

.status-error {
    background-color: var(--error-red-10);
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
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    padding-top: var(--spacing-md);
}

/* 统计信息网格 - 5列布局 */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: var(--spacing-sm);
}

.stat-item {
    display: flex;
    flex-direction: row;
    align-items: baseline;
    justify-content: center;
    padding: var(--spacing-sm) var(--spacing-sm);
    gap: 6px;
    flex-wrap: wrap;
}

.stat-label {
    font-size: 12px;
    color: var(--text-secondary);
    font-weight: 500;
}

.stat-value {
    font-size: 14px;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1.2;
}

/* 桌面端隐藏颜色指示条，因为现在是行内布局 */
.stat-indicator {
    display: none;
}

.stat-indicator-blue {
    background-color: #2563eb;
}

.stat-indicator-green {
    background-color: #22c55e;
}

.stat-indicator-orange {
    background-color: #f59e0b;
}

/* 详情卡片通用样式 */
.detail-card {
    background-color: var(--bg-gray);
    border-radius: var(--radius-md);
    padding: var(--spacing-sm);
}

/* 分片进度条 - 连续填充样式 */
.bitfield-card {
    padding: var(--spacing-sm);
    display: flex;
    align-items: center;
}

.bitfield-continuous-bar {
    position: relative;
    width: 100%;
    height: 12px;
    background-color: var(--border-gray);
    border-radius: 4px;
    overflow: hidden;
}

.bitfield-progress-bg {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    background-color: var(--primary-blue-10);
    transition: width 0.3s ease;
}

/* 已下载分片高亮填充 */
.filled-segment {
    position: absolute;
    top: 0;
    height: 100%;
    background-color: var(--primary-blue);
    transition: all 0.2s ease;
}

.path-value {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-secondary);
    word-break: break-all;
    opacity: 0.8;
}

/* Torrent 文件列表 */
.torrent-files {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
}

.files-header {
    margin-bottom: 0;
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
    background-color: var(--primary-blue-10);
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

    /* 移动端展开面板适配 */
    .task-expanded {
        padding: 0 var(--spacing-md) var(--spacing-md);
        padding-top: var(--spacing-md);
    }

    /* 移动端保持5列单行布局，不换行 */
    .stats-grid {
        grid-template-columns: repeat(5, 1fr);
        gap: 2px;
    }

    .stat-item {
        flex-direction: column;
        align-items: center;
        padding: var(--spacing-sm) 2px;
        gap: 2px;
    }

    .stat-label {
        font-size: 9px;
    }

    .stat-value {
        font-size: 11px;
        line-height: 1.2;
    }

    /* 移动端恢复显示颜色指示条 */
    .stat-indicator {
        display: block;
        width: 20px;
        height: 2px;
        margin-top: 1px;
    }

    /* 移动端详情卡片 */
    .detail-card {
        padding: var(--spacing-sm) var(--spacing-md);
    }

    .bitfield-card {
        padding: var(--spacing-sm) var(--spacing-md);
    }

    .bitfield-continuous-bar {
        height: 14px;
    }

    .path-card {
        padding: var(--spacing-sm) var(--spacing-md);
    }

    .path-value {
        font-size: 12px;
        word-break: break-all;
    }
}


.task-tooltip {
    position: fixed;
    background-color: var(--tooltip-bg);
    color: var(--tooltip-text);
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 13px;
    max-width: 300px;
    word-wrap: break-word;
    z-index: 9999;
    pointer-events: none;
    box-shadow: 0 2px 8px var(--shadow-black);
    white-space: normal;
}

.task-tooltip::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: var(--tooltip-bg) transparent transparent transparent;
}
</style>