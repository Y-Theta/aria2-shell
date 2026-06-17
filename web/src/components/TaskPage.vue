<template>
    <div class="task-page">
        <task-toolbar
            v-model:searchText="searchText"
            @addTask="handleAddTask"
            @startAll="handleStartAll"
            @pauseAll="handlePauseAll"
            @deleteAll="handleDeleteAll"
        />
        <task-list
            :tasks="tasks"
            :searchText="searchText"
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
            :totalTasks="tasks.length"
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

const props = withDefaults(defineProps<{
    tasks?: Task[]
}>(), {
    tasks: () => [],
})

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
}>()

const searchText = ref('')

const totalDownloadSpeed = computed(() => {
    return props.tasks.reduce((sum, task) => sum + task.downloadSpeed, 0)
})

const totalUploadSpeed = computed(() => {
    return props.tasks.reduce((sum, task) => sum + task.uploadSpeed, 0)
})

const downloadingCount = computed(() => {
    return props.tasks.filter(task => task.status === 'downloading' || task.status === 'seeding').length
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
        position: fixed;
        bottom: 72px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 1000;
        width: auto;
        max-width: none;
        border-radius: 20px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
}
</style>