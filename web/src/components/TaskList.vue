<template>
    <div class="task-list">
        <div v-if="tasks.length === 0" class="empty-state">
            <i class="fas fa-inbox"></i>
            <p>{{ t('sidebar.all') }}</p>
        </div>
        <div v-else class="task-table">
            <!-- 表头 -->
            <div class="task-header">
                <div class="header-cell info-cell" :style="getColumnStyle('info')">
                    {{ t('taskPage.fileName') }}
                    <div class="resize-handle" @mousedown="handleResizeStart($event, 'info')"></div>
                </div>
                <div v-for="(column, index) in visibleColumns" :key="column.id" class="header-cell" :style="getColumnStyle(column.id)" @mousedown="handleDragStart($event, index)" @mouseenter="handleDragOver($event, index)" @mouseup="handleDrop($event, index)">
                    {{ column.label }}
                    <div class="resize-handle" @mousedown="handleResizeStart($event, column.id)"></div>
                </div>
            </div>
            <!-- 任务项 -->
            <div class="task-body">
                <task-item v-for="task in filteredTasks" :key="task.id" :task="task" :column-order="visibleColumns" :column-widths="columnWidths" @start="$emit('start', $event)" @pause="$emit('pause', $event)" @delete="$emit('delete', $event)" @openFolder="$emit('openFolder', $event)" @openFile="$emit('openFile', $event)" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
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

const visibleColumns = computed(() => {
    return temporaryOrder.value || columnOrder.value
})

const props = defineProps<{
    tasks: Task[]
    searchText: string
}>()

const filteredTasks = computed(() => {
    if (!props.searchText) return props.tasks
    const searchLower = props.searchText.toLowerCase()
    return props.tasks.filter(task => 
        task.name.toLowerCase().includes(searchLower)
    )
})

const getColumnStyle = (columnId: string) => {
    return {
        flex: columnWidths.value[columnId],
    }
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

const handleDragMove = (event: MouseEvent) => {
    if (!isDragging.value) return
}

const handleDragOver = (event: MouseEvent, index: number) => {
    if (!isDragging.value || !temporaryOrder.value) return
    if (index === draggedIndex.value) return
    
    const columns = [...temporaryOrder.value]
    const fromIndex = draggedIndex.value
    const [removed] = columns.splice(fromIndex, 1)
    columns.splice(index, 0, removed)
    temporaryOrder.value = columns
    draggedIndex.value = index
}

const handleDrop = (event: MouseEvent, index: number) => {
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

onMounted(() => {})

onUnmounted(() => {
    document.removeEventListener('mousemove', handleDragMove)
    document.removeEventListener('mouseup', handleDragEnd)
    document.removeEventListener('mousemove', handleResize)
    document.removeEventListener('mouseup', handleResizeEnd)
})

defineEmits<{
    (e: 'start', id: string): void
    (e: 'pause', id: string): void
    (e: 'delete', id: string): void
    (e: 'openFolder', id: string): void
    (e: 'openFile', id: string): void
}>()
</script>

<style scoped>
.task-list {
    flex: 1;
    overflow-y: auto;
    padding: var(--spacing-lg);
}

.task-table {
    display: flex;
    flex-direction: column;
}

.task-header {
    display: flex;
    align-items: center;
    padding: var(--spacing-lg);
    background-color: var(--panel-bg);
    border-radius: var(--radius-md);
    margin-bottom: var(--spacing-sm);
    border: 1px solid var(--border-gray);
    user-select: none;
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

.header-cell.info-cell {
    justify-content: flex-start;
    padding-left: 0;
    cursor: default;
}

.header-cell.info-cell:hover {
    background-color: transparent;
}

.task-body {
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
        padding-bottom: 180px;
    }
}
</style>