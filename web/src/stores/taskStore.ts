import { reactive, computed } from 'vue'
import type { Task } from '@common/task'
import type { ListType } from '@common/types'

interface TaskState {
    tasks: Record<ListType, Task[]>
    lastUpdated: Record<ListType, number>
    availableSpace: number
}

const state = reactive<TaskState>({
    tasks: {
        active: [],
        paused: [],
        completed: [],
        torrents: []
    },
    lastUpdated: {
        active: 0,
        paused: 0,
        completed: 0,
        torrents: 0
    },
    availableSpace: 0
})

export function useTaskStore() {
    const setTasks = (type: ListType, tasks: Task[]) => {
        state.tasks[type] = tasks
        state.lastUpdated[type] = Date.now()
    }

    const getTasks = (type: ListType) => {
        return computed(() => state.tasks[type])
    }

    const getTaskById = (gid: string): Task | undefined => {
        for (const type of Object.keys(state.tasks) as ListType[]) {
            const task = state.tasks[type].find(t => t.id === gid)
            if (task) return task
        }
        return undefined
    }

    const removeTaskFromList = (gid: string) => {
        for (const type of Object.keys(state.tasks) as ListType[]) {
            const index = state.tasks[type].findIndex(t => t.id === gid)
            if (index !== -1) {
                state.tasks[type].splice(index, 1)
                return true
            }
        }
        return false
    }

    const removeTasksFromList = (gids: string[]) => {
        const gidSet = new Set(gids)
        for (const type of Object.keys(state.tasks) as ListType[]) {
            state.tasks[type] = state.tasks[type].filter(t => !gidSet.has(t.id))
        }
    }

    const updateTaskInList = (gid: string, updates: Partial<Task>) => {
        for (const type of Object.keys(state.tasks) as ListType[]) {
            const task = state.tasks[type].find(t => t.id === gid)
            if (task) {
                Object.assign(task, updates)
                return true
            }
        }
        return false
    }

    const clearAllTasks = () => {
        for (const type of Object.keys(state.tasks) as ListType[]) {
            state.tasks[type] = []
            state.lastUpdated[type] = 0
        }
    }

    const getTaskCount = (type: ListType) => {
        return computed(() => state.tasks[type].length)
    }

    const getTotalDownloadSpeed = computed(() => {
        return state.tasks.active.reduce((sum, task) => sum + task.downloadSpeed, 0)
    })

    const getTotalUploadSpeed = computed(() => {
        let total = 0
        for (const type of Object.keys(state.tasks) as ListType[]) {
            total += state.tasks[type].reduce((sum, task) => sum + task.uploadSpeed, 0)
        }
        return total
    })

    const getDownloadingCount = computed(() => {
        return state.tasks.active.filter(t => t.status === 'downloading' || t.status === 'seeding').length
    })

    const getTotalTasksCount = computed(() => {
        let total = 0
        for (const type of Object.keys(state.tasks) as ListType[]) {
            total += state.tasks[type].length
        }
        return total
    })

    const setAvailableSpace = (space: number) => {
        state.availableSpace = space
    }

    const getAvailableSpace = computed(() => state.availableSpace)

    return {
        state,
        setTasks,
        getTasks,
        getTaskById,
        removeTaskFromList,
        removeTasksFromList,
        updateTaskInList,
        clearAllTasks,
        getTaskCount,
        getTotalDownloadSpeed,
        getTotalUploadSpeed,
        getDownloadingCount,
        getTotalTasksCount,
        setAvailableSpace,
        getAvailableSpace
    }
}