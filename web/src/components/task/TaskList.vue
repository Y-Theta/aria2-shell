<template>
    <div class="task-list">
        <div v-if="tasks.length === 0" class="empty-state">
            <i class="fas fa-inbox"></i>
            <p>{{ t('sidebar.all') }}</p>
        </div>
        <div v-else class="task-table">
            <!-- 表头 -->
            <div class="task-header">
                <div v-if="isBatchMode" class="header-cell checkbox-cell">
                    <input
                        type="checkbox"
                        :checked="isAllSelected"
                        @change="toggleSelectAll"
                    />
                </div>
                <div class="header-cell info-cell" :style="getColumnStyle('info')">
                    {{ t('taskPage.fileName') }}
                    <div class="resize-handle" @mousedown="handleResizeStart($event, 'info')"></div>
                </div>
                <div v-for="(column, index) in visibleColumns" :key="column.id" class="header-cell" :style="getColumnStyle(column.id)" @mousedown="handleDragStart($event, index)" @mouseenter="handleDragOver($event, index)" @mouseup="handleDrop($event, index)">
                    {{ column.label }}
                    <div class="resize-handle" @mousedown="handleResizeStart($event, column.id)"></div>
                </div>
            </div>
            <!-- 任务项 - 虚拟滚动列表 -->
            <div ref="scrollContainer" class="task-body" @scroll="handleScroll">
                <div class="virtual-list-container" :style="{ height: totalHeight + 'px' }">
                    <div
                        class="virtual-list-items"
                        :style="{ transform: `translateY(${offsetY}px)` }"
                    >
                        <task-item
                            v-for="task in visibleTasks"
                            :key="task.id"
                            :task="task"
                            :column-order="visibleColumns"
                            :column-widths="columnWidths"
                            :is-batch-mode="isBatchMode"
                            :is-selected="selectedIds.includes(task.id)"
                            :is-expanded="expandedIds.has(task.id)"
                            @start="$emit('start', $event)"
                            @pause="$emit('pause', $event)"
                            @delete="$emit('delete', $event)"
                            @openFolder="$emit('openFolder', $event)"
                            @openFile="$emit('openFile', $event)"
                            @toggle-select="toggleSelect"
                            @toggle-expand="toggleExpand"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import TaskItem from './TaskItem.vue'

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

interface TorrentFile {
    id: string
    name: string
    size: number
    progress: number
    priority: 'high' | 'normal' | 'low'
}

interface Column {
    id: string
    label: string
}

const { t } = useI18n()

const defaultColumns: Column[] = [
    { id: 'size', label: t('taskPage.size') },
    { id: 'progress', label: t('taskPage.progress') },
    { id: 'speed', label: t('taskPage.speed') },
    { id: 'status', label: t('taskPage.status') },
    { id: 'actions', label: t('taskPage.actions') },
]

const columnOrder = ref<Column[]>([...defaultColumns])
const columnWidths = ref<Record<string, number>>({
    info: 2,
    size: 1.5,
    progress: 1.5,
    speed: 0.8,
    status: 0.8,
    actions: 1,
})

const draggedIndex = ref<number>(-1)
const resizingColumn = ref<string | null>(null)
const startX = ref<number>(0)
const isDragging = ref(false)
const temporaryOrder = ref<Column[] | null>(null)
const selectedIds = ref<string[]>([])
const expandedIds = ref<Set<string>>(new Set()) // 管理展开状态

// 虚拟滚动相关
const scrollContainer = ref<HTMLDivElement | null>(null)
const itemHeight = ref(72) // 每个TaskItem的高度
const visibleTasks = ref<Task[]>([])
const offsetY = ref(0)
const startIndex = ref(0)
const endIndex = ref(0)

const visibleColumns = computed(() => {
    return temporaryOrder.value || columnOrder.value
})

const props = defineProps<{
    tasks: Task[]
    searchText: string
    isBatchMode: boolean
}>()

const filteredTasks = computed(() => {
    if (!props.searchText) return props.tasks
    const searchLower = props.searchText.toLowerCase()
    return props.tasks.filter(task => 
        task.name.toLowerCase().includes(searchLower)
    )
})

const totalHeight = computed(() => {
    let height = 0
    for (const task of filteredTasks.value) {
        height += expandedIds.value.has(task.id) ? (itemHeight.value + 200) : itemHeight.value
    }
    return height
})

const toggleExpand = (id: string) => {
    if (expandedIds.value.has(id)) {
        expandedIds.value.delete(id)
    } else {
        expandedIds.value.add(id)
    }
    nextTick(() => {
        updateVisibleItems()
    })
}

const isAllSelected = computed(() => {
    return filteredTasks.value.length > 0 && filteredTasks.value.every(task => selectedIds.value.includes(task.id))
})

const toggleSelect = (id: string) => {
    const index = selectedIds.value.indexOf(id)
    if (index > -1) {
        selectedIds.value.splice(index, 1)
    } else {
        selectedIds.value.push(id)
    }
    emit('update:selectedIds', [...selectedIds.value])
}

const toggleSelectAll = () => {
    if (isAllSelected.value) {
        selectedIds.value = []
    } else {
        selectedIds.value = filteredTasks.value.map(task => task.id)
    }
    emit('update:selectedIds', [...selectedIds.value])
}

const getColumnStyle = (columnId: string) => {
    return {
        flex: columnWidths.value[columnId],
    }
}

// 更新可见的任务项
const updateVisibleItems = () => {
    if (!scrollContainer.value) return
    
    const scrollTop = scrollContainer.value.scrollTop
    const containerHeight = scrollContainer.value.clientHeight
    
    // 计算每个项目的高度和位置
    const items = []
    let currentHeight = 0
    
    for (let i = 0; i < filteredTasks.value.length; i++) {
        const task = filteredTasks.value[i]
        const height = expandedIds.value.has(task.id) ? (itemHeight.value + 200) : itemHeight.value
        items.push({
            index: i,
            task,
            top: currentHeight,
            height
        })
        currentHeight += height
    }
    
    // 找到第一个与滚动区域重叠的项目
    let startIdx = 0
    for (let i = 0; i < items.length; i++) {
        if (items[i].top + items[i].height > scrollTop) {
            startIdx = i
            break
        }
    }
    
    // 找到最后一个与滚动区域重叠的项目
    let endIdx = items.length - 1
    for (let i = startIdx; i < items.length; i++) {
        if (items[i].top > scrollTop + containerHeight) {
            endIdx = i - 1
            break
        }
    }
    
    // 加上buffer
    const buffer = 5
    const newStartIndex = Math.max(0, startIdx - buffer)
    const newEndIndex = Math.min(items.length, endIdx + buffer)
    
    startIndex.value = newStartIndex
    endIndex.value = newEndIndex
    
    // 计算偏移量
    offsetY.value = items[newStartIndex].top
    
    // 更新可见任务
    visibleTasks.value = filteredTasks.value.slice(newStartIndex, newEndIndex)
}

const handleScroll = () => {
    updateVisibleItems()
}

const handleDragStart = (event: MouseEvent, index: number) => {
    if (resizingColumn.value) return
    
    event.preventDefault()
    event.stopPropagation()
    
    isDragging.value = true
    draggedIndex.value = index
    startX.value = event.clientX
    temporaryOrder.value = [...columnOrder.value]
    
    document.addEventListener('mousemove', handleDragMove)
    document.addEventListener('mouseup', handleDragEnd)
}

const handleDragMove = (_event: MouseEvent) => {
    if (!isDragging.value) return
}

const handleDragOver = (_event: MouseEvent, index: number) => {
    if (!isDragging.value || !temporaryOrder.value) return
    if (index === draggedIndex.value) return
    
    const columns = [...temporaryOrder.value]
    const fromIndex = draggedIndex.value
    const [removed] = columns.splice(fromIndex, 1)
    columns.splice(index, 0, removed)
    temporaryOrder.value = columns
    draggedIndex.value = index
}

const handleDrop = (_event: MouseEvent, _index: number) => {
    if (!isDragging.value) return
    
    if (temporaryOrder.value) {
        columnOrder.value = [...temporaryOrder.value]
    }
    
    handleDragEnd()
}

const handleDragEnd = () => {
    isDragging.value = false
    draggedIndex.value = -1
    temporaryOrder.value = null
    
    document.removeEventListener('mousemove', handleDragMove)
    document.removeEventListener('mouseup', handleDragEnd)
}

const handleResizeStart = (event: MouseEvent, columnId: string) => {
    event.preventDefault()
    event.stopPropagation()
    resizingColumn.value = columnId
    startX.value = event.clientX
    
    document.addEventListener('mousemove', handleResize)
    document.addEventListener('mouseup', handleResizeEnd)
}

const handleResize = (event: MouseEvent) => {
    if (!resizingColumn.value) return
    
    const deltaX = event.clientX - startX.value
    const change = deltaX / 100
    
    const newWidth = Math.max(0.5, columnWidths.value[resizingColumn.value] + change)
    columnWidths.value[resizingColumn.value] = newWidth
    startX.value = event.clientX
}

const handleResizeEnd = () => {
    resizingColumn.value = null
    document.removeEventListener('mousemove', handleResize)
    document.removeEventListener('mouseup', handleResizeEnd)
}

watch(() => props.isBatchMode, (newVal) => {
    if (!newVal) {
        selectedIds.value = []
        emit('update:selectedIds', [])
    }
})

// 当任务变化时，重新计算可见项
watch(() => filteredTasks.value, () => {
    updateVisibleItems()
}, { deep: true })

onMounted(() => {
    // 延迟确保DOM渲染
    nextTick(() => {
        updateVisibleItems()
    })
})

onUnmounted(() => {
    document.removeEventListener('mousemove', handleDragMove)
    document.removeEventListener('mouseup', handleDragEnd)
    document.removeEventListener('mousemove', handleResize)
    document.removeEventListener('mouseup', handleResizeEnd)
})

const emit = defineEmits<{
    (e: 'start', id: string): void
    (e: 'pause', id: string): void
    (e: 'delete', id: string): void
    (e: 'openFolder', id: string): void
    (e: 'openFile', id: string): void
    (e: 'toggle-select', id: string): void
    (e: 'update:selectedIds', ids: string[]): void
}>()
</script>

<style scoped>
.task-list {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: var(--spacing-lg);
    overflow: hidden;
}

.task-table {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
}

.task-header {
    display: flex;
    align-items: center;
    padding: var(--spacing-lg);
    padding-right: calc(var(--spacing-lg) + 12px);
    background-color: var(--panel-bg);
    border-radius: var(--radius-md);
    margin-bottom: var(--spacing-sm);
    border: 1px solid var(--border-gray);
    user-select: none;
    flex-shrink: 0;
}

.header-cell {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    border-right: 1px solid var(--border-gray);
    padding: 0 var(--spacing-md);
    cursor: grab;
    transition: background-color 0.15s ease;
}

.header-cell:hover {
    background-color: var(--bg-gray);
}

.header-cell:active {
    cursor: grabbing;
}

.header-cell:last-child {
    border-right: none;
}

.header-cell.checkbox-cell {
    cursor: default;
    flex: 0 0 40px;
}

.header-cell.info-cell {
    justify-content: flex-start;
    padding-left: 0;
    cursor: default;
}

.header-cell.info-cell:hover {
    background-color: transparent;
}

.task-body {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    min-height: 0;
    padding-right: 2px;
    padding-left: 2px;
    position: relative;
}

.task-body::-webkit-scrollbar {
    width: 8px;
}

.task-body::-webkit-scrollbar-track {
    background: var(--bg-gray);
    border-radius: 4px;
}

.task-body::-webkit-scrollbar-thumb {
    background: var(--border-gray);
    border-radius: 4px;
}

.task-body::-webkit-scrollbar-thumb:hover {
    background: var(--neutral-gray);
}

.virtual-list-container {
    position: relative;
    width: 100%;
}

.virtual-list-items {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
}

.resize-handle {
    position: absolute;
    right: 0;
    top: 0;
    width: 6px;
    height: 100%;
    cursor: col-resize;
    z-index: 10;
    background: transparent;
}

.resize-handle:hover {
    background: var(--primary-blue);
    opacity: 0.3;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-2xl);
    color: var(--text-muted);
}

.empty-state i {
    font-size: 48px;
    margin-bottom: var(--spacing-md);
    opacity: 0.5;
}

.empty-state p {
    font-size: 14px;
}

@media (max-width: 768px) {
    .task-header {
        display: none;
    }

    .task-list {
        overflow: hidden;
    }

    .task-table {
        overflow: hidden;
    }

    .task-body {
        overflow-y: auto;
        padding-right: 4px;
    }

    .task-body::-webkit-scrollbar {
        width: 4px;
    }

    .task-body::-webkit-scrollbar-track {
        background: transparent;
        border-radius: 2px;
    }

    .task-body::-webkit-scrollbar-thumb {
        background: var(--border-gray);
        border-radius: 4px;
    }
}
</style>