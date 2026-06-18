<template>
    <div class="task-page">
        <task-toolbar
            v-model:searchText="searchText"
            v-model:isBatchMode="isBatchMode"
            :selectedCount="selectedIds.length"
            @addTask="handleAddTask"
            @startAll="handleStartAll"
            @pauseAll="handlePauseAll"
            @deleteAll="handleDeleteAll"
            @startSelected="handleStartSelected"
            @pauseSelected="handlePauseSelected"
            @deleteSelected="handleDeleteSelected"
        />
        <task-list
            :tasks="tasks!"
            :searchText="searchText"
            :isBatchMode="isBatchMode"
            v-model:selectedIds="selectedIds"
            @start="handleStart"
            @pause="handlePause"
            @delete="handleDelete"
            @openFolder="handleOpenFolder"
            @openFile="handleOpenFile"
        />
        <task-footer
            class="task-footer-component"
            :totalDownloadSpeed="totalDownloadSpeed"
            :totalUploadSpeed="totalUploadSpeed"
            :downloadingCount="downloadingCount"
            :availableSpace="availableSpace"
            :totalTasks="tasks!.length"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import TaskToolbar from './TaskToolbar.vue'
import TaskList from './TaskList.vue'
import TaskFooter from './TaskFooter.vue'

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
}

const props = defineProps<{
    tasks?: Task[]
}>()

const emit = defineEmits<{
    (e: 'addTask'): void
    (e: 'startAll'): void
    (e: 'pauseAll'): void
    (e: 'deleteAll'): void
    (e: 'start', id: string): void
    (e: 'pause', id: string): void
    (e: 'delete', id: string): void
    (e: 'openFolder', id: string): void
    (e: 'openFile', id: string): void
    (e: 'startSelected', ids: string[]): void
    (e: 'pauseSelected', ids: string[]): void
    (e: 'deleteSelected', ids: string[]): void
}>()

const searchText = ref('')
const isBatchMode = ref(false)
const selectedIds = ref<string[]>([])

const totalDownloadSpeed = computed(() => {
    const t = props.tasks || []
    return t.reduce((sum, task) => sum + task.downloadSpeed, 0)
})

const totalUploadSpeed = computed(() => {
    const t = props.tasks || []
    return t.reduce((sum, task) => sum + task.uploadSpeed, 0)
})

const downloadingCount = computed(() => {
    const t = props.tasks || []
    return t.filter(task => task.status === 'downloading' || task.status === 'seeding').length
})

const availableSpace = ref(128 * 1024 * 1024 * 1024) // 128 GB

const handleAddTask = () => emit('addTask')
const handleStartAll = () => emit('startAll')
const handlePauseAll = () => emit('pauseAll')
const handleDeleteAll = () => emit('deleteAll')
const handleStart = (id: string) => emit('start', id)
const handlePause = (id: string) => emit('pause', id)
const handleDelete = (id: string) => emit('delete', id)
const handleOpenFolder = (id: string) => emit('openFolder', id)
const handleOpenFile = (id: string) => emit('openFile', id)
const handleStartSelected = () => emit('startSelected', [...selectedIds.value])
const handlePauseSelected = () => emit('pauseSelected', [...selectedIds.value])
const handleDeleteSelected = () => emit('deleteSelected', [...selectedIds.value])
</script>

<style scoped>
.task-page {
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: var(--app-bg);
}

@media (max-width: 768px) {
    .task-page {
        padding-bottom: 0;
    }

    .task-footer-component {
        display: none;
    }
}
</style>