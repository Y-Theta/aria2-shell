<template>
    <div class="task-list">
        <div v-if="filteredTasks.length === 0" class="empty-state">
            <i class="fas fa-inbox"></i>
            <p>{{ searchText ? '没有找到匹配的任务' : t('sidebar.all') }}</p>
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
import type { Task } from '@common/task'

interface Column {
    id: string
    label: string
}

// 带搜索索引的任务项，预处理后的数据结构
interface IndexedTask {
    task: Task
    searchText: string  // 预计算的搜索文本（文件名+GID+路径转小写）
}

interface LayoutItem {
    index: number
    task: Task
    top: number
    height: number
    bottom: number
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
const expandedIds = ref<Set<string>>(new Set())

// 虚拟滚动相关
const scrollContainer = ref<HTMLDivElement | null>(null)
const itemHeight = ref(72)
const expandedItemHeight = ref(272) // 展开后的高度
const visibleTasks = ref<Task[]>([])
const offsetY = ref(0)
const startIndex = ref(0)
const endIndex = ref(0)

// 布局缓存 - 预先计算好的位置信息
const layoutCache = ref<LayoutItem[]>([])
const totalHeight = ref(0)

const visibleColumns = computed(() => {
    return temporaryOrder.value || columnOrder.value
})

const props = defineProps<{
    tasks: Task[]
    searchText: string
    isBatchMode: boolean
}>()

// 防抖处理后的搜索文本
const debouncedSearchText = ref('')
let searchDebounceTimer: number | null = null

// 监听搜索文本，添加200ms防抖
watch(() => props.searchText, (newText) => {
    if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer)
    }
    searchDebounceTimer = window.setTimeout(() => {
        debouncedSearchText.value = newText.toLowerCase().trim()
    }, 200)
}, { immediate: true })

// 预处理任务索引 - 加载时一次性计算好搜索文本
const indexedTasks = computed<IndexedTask[]>(() => {
    return props.tasks.map(task => {
        // 预处理：拼接所有搜索字段并转小写，只做一次
        const searchParts = [
            task.name || '',
            task.id || '',
            task.path || ''
        ]
        return {
            task,
            searchText: searchParts.join(' ').toLowerCase()
        }
    })
})

// 过滤后的任务（使用防抖和预处理索引）
const filteredTasks = computed<Task[]>(() => {
    const search = debouncedSearchText.value
    if (!search) {
        return props.tasks
    }
    return indexedTasks.value
        .filter(item => item.searchText.includes(search))
        .map(item => item.task)
})

// 二分查找：在布局缓存中找到第一个可见项的索引
function binarySearchStart(scrollTop: number): number {
    let low = 0
    let high = layoutCache.value.length - 1
    
    while (low <= high) {
        const mid = Math.floor((low + high) / 2)
        const item = layoutCache.value[mid]
        
        if (item.bottom < scrollTop) {
            low = mid + 1
        } else if (item.top > scrollTop) {
            high = mid - 1
        } else {
            return mid
        }
    }
    
    return Math.max(0, low)
}

// 重新计算布局缓存
function recalculateLayout() {
    const tasks = filteredTasks.value
    const items: LayoutItem[] = []
    let currentTop = 0
    
    for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i]
        const isExpanded = expandedIds.value.has(task.id)
        const height = isExpanded ? expandedItemHeight.value : itemHeight.value
        
        items.push({
            index: i,
            task,
            top: currentTop,
            height,
            bottom: currentTop + height
        })
        
        currentTop += height
    }
    
    layoutCache.value = items
    totalHeight.value = currentTop
}

const toggleExpand = (id: string) => {
    if (expandedIds.value.has(id)) {
        expandedIds.value.delete(id)
    } else {
        expandedIds.value.add(id)
    }
    // 展开/收起时只需要重新计算布局，不需要全量重新过滤
    recalculateLayout()
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

// 更新可见的任务项 - 使用二分查找优化
const updateVisibleItems = () => {
    if (!scrollContainer.value) return
    
    const cache = layoutCache.value
    
    // 空列表处理
    if (cache.length === 0) {
        visibleTasks.value = []
        offsetY.value = 0
        startIndex.value = 0
        endIndex.value = 0
        return
    }
    
    const scrollTop = scrollContainer.value.scrollTop
    const containerHeight = scrollContainer.value.clientHeight
    const viewportBottom = scrollTop + containerHeight
    
    // 使用二分查找找到起始索引
    const startIdx = binarySearchStart(scrollTop)
    
    // 找到结束索引（从起始位置线性查找，因为可见项很少，不需要二次二分）
    let endIdx = cache.length - 1
    for (let i = startIdx; i < cache.length; i++) {
        if (cache[i].top > viewportBottom) {
            endIdx = i - 1
            break
        }
    }
    
    // 加上buffer
    const buffer = 8
    const newStartIndex = Math.max(0, startIdx - buffer)
    const newEndIndex = Math.min(cache.length, endIdx + buffer + 1)
    
    startIndex.value = newStartIndex
    endIndex.value = newEndIndex
    
    // 计算偏移量
    offsetY.value = cache[newStartIndex] ? cache[newStartIndex].top : 0
    
    // 更新可见任务
    visibleTasks.value = []
    for (let i = newStartIndex; i < newEndIndex; i++) {
        visibleTasks.value.push(cache[i].task)
    }
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

// 统一监听数据源变化，重新计算布局和可见项
// 使用 shallow watch 不深度遍历对象，比原来 deep: true 性能好很多
watch([() => props.tasks, debouncedSearchText], () => {
    recalculateLayout()
    nextTick(() => {
        updateVisibleItems()
    })
}, { deep: false })

// 组件挂载和卸载
onMounted(() => {
    // 延迟确保DOM渲染
    nextTick(() => {
        recalculateLayout()
        updateVisibleItems()
    })
})

onUnmounted(() => {
    if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer)
    }
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