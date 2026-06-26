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
        <add-task-dialog v-model:visible="showAddTaskDialog" @addTask="handleConfirmAddTask" />
        <confirm-dialog
            v-model:visible="showDeleteConfirm"
            :title="deleteConfirmTitle"
            :message="deleteConfirmMessage"
            :show-delete-file-option="true"
            :delete-file-label="t('taskPage.deleteLocalFile')"
            @confirm="confirmDelete"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import TaskToolbar from '../components/task/TaskToolbar.vue'
import TaskList from '../components/task/TaskList.vue'
import TaskFooter from '../components/task/TaskFooter.vue'
import AddTaskDialog from '../components/dialogs/AddTaskDialog.vue'
import ConfirmDialog from '../components/dialogs/ConfirmDialog.vue'
import type { Task } from '@common/task'

const { t } = useI18n()

const props = defineProps<{
    tasks?: Task[]
}>()

const emit = defineEmits<{
    (e: 'addTask'): void
    (e: 'addTaskWithData', data: any): void
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
    (e: 'confirmDelete', id: string, deleteLocalFile: boolean): void
    (e: 'confirmDeleteSelected', ids: string[], deleteLocalFile: boolean): void
    (e: 'confirmDeleteAll', deleteLocalFile: boolean): void
}>()

const showAddTaskDialog = ref(false)
const showDeleteConfirm = ref(false)

const searchText = ref('')
const isBatchMode = ref(false)
const selectedIds = ref<string[]>([])

type DeleteMode = 'single' | 'selected' | 'all' | null
const deleteMode = ref<DeleteMode>(null)
const deleteTargetId = ref<string | null>(null)

const deleteConfirmTitle = computed(() => {
    switch (deleteMode.value) {
        case 'single':
            return t('taskPage.deleteTask')
        case 'selected':
            return t('taskPage.deleteSelectedTasks')
        case 'all':
            return t('taskPage.deleteAllTasks')
        default:
            return ''
    }
})

const deleteConfirmMessage = computed(() => {
    switch (deleteMode.value) {
        case 'single':
            return t('taskPage.deleteTaskConfirm')
        case 'selected':
            return t('taskPage.deleteSelectedTasksConfirm', { count: selectedIds.value.length })
        case 'all':
            return t('taskPage.deleteAllTasksConfirm')
        default:
            return ''
    }
})

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

const handleAddTask = () => {
    showAddTaskDialog.value = true
}

const handleConfirmAddTask = (data: any) => {
    emit('addTaskWithData', data)
}
const handleStartAll = () => emit('startAll')
const handlePauseAll = () => emit('pauseAll')
const handleDeleteAll = () => {
    deleteMode.value = 'all'
    showDeleteConfirm.value = true
}
const handleStart = (id: string) => emit('start', id)
const handlePause = (id: string) => emit('pause', id)
const handleDelete = (id: string) => {
    deleteMode.value = 'single'
    deleteTargetId.value = id
    showDeleteConfirm.value = true
}
const handleOpenFolder = (id: string) => emit('openFolder', id)
const handleOpenFile = (id: string) => emit('openFile', id)
const handleStartSelected = () => emit('startSelected', [...selectedIds.value])
const handlePauseSelected = () => emit('pauseSelected', [...selectedIds.value])
const handleDeleteSelected = () => {
    if (selectedIds.value.length === 0) return
    deleteMode.value = 'selected'
    showDeleteConfirm.value = true
}

const confirmDelete = (deleteLocalFile: boolean) => {
    switch (deleteMode.value) {
        case 'single':
            if (deleteTargetId.value) {
                emit('confirmDelete', deleteTargetId.value, deleteLocalFile)
            }
            break
        case 'selected':
            emit('confirmDeleteSelected', [...selectedIds.value], deleteLocalFile)
            selectedIds.value = []
            isBatchMode.value = false
            break
        case 'all':
            emit('confirmDeleteAll', deleteLocalFile)
            break
    }
    deleteMode.value = null
    deleteTargetId.value = null
}
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