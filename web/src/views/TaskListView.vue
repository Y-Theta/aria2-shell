<template>
    <task-page
        :tasks="currentTasks"
        @addTask="onAddTask"
        @addTaskWithData="onAddTaskWithData"
        @startAll="onStartAll"
        @pauseAll="onPauseAll"
        @deleteAll="onDeleteAll"
        @start="onStart"
        @pause="onPause"
        @delete="onDelete"
        @openFolder="onOpenFolder"
        @openFile="onOpenFile"
        @confirmDelete="onConfirmDelete"
        @confirmDeleteSelected="onConfirmDeleteSelected"
        @confirmDeleteAll="onConfirmDeleteAll"
    />
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, onActivated, onDeactivated, watch } from 'vue'
import { useRoute } from 'vue-router'
import TaskPage from './TaskPage.vue'
import { getActiveTasks, getWaitingTasks, getStoppedTasks, getAllTaskLists, pauseTask, unpauseTask, removeTask } from '../services/aria2'
import { useTaskStore } from '../stores/taskStore'
import { useDashboardStore } from '../stores/dashboardStore'
import type { Task } from '@common/task'
import type { ListType } from '@common/types'

const route = useRoute()
const taskStore = useTaskStore()
const dashboardStore = useDashboardStore()
let refreshInterval: number | null = null

// 当前列表类型
const listType = computed<ListType>(() => {
    const name = route.name as string
    if (['active', 'paused', 'completed', 'torrents'].includes(name)) {
        return name as ListType
    }
    return 'active'
})

// 从缓存获取当前列表的任务
const currentTasks = computed(() => taskStore.getTasks(listType.value).value)

// 根据列表类型获取刷新间隔 - 降低请求频率
const refreshIntervalTime = computed(() => {
    switch (listType.value) {
        case 'active':
            return 3000 // 活跃下载每3秒刷新一次
        case 'paused':
        case 'torrents':
            return 5000 // 暂停/种子页面每5秒刷新
        case 'completed':
            return 10000 // 已完成页面每10秒刷新
        default:
            return 5000
    }
})

// 监听dashboard数据变化，同步更新可用空间到taskStore保持兼容
// 初始同步
taskStore.setAvailableSpace(dashboardStore.getDiskSpace.value)
// 变化时同步
watch(
    () => dashboardStore.getDiskSpace.value,
    (space) => {
        taskStore.setAvailableSpace(space)
    }
)

// 单个列表类型加载
const loadTaskType = async (type: ListType): Promise<void> => {
    try {
        switch (type) {
            case 'active': {
                // 下载中页面定时刷新时，每5次大约有1次全量更新所有列表缓存
                // 这样既能保持高频刷新下载进度，又不会太频繁请求大列表
                // 全量更新会顺便更新paused/completed/torrents缓存，用户切换页面时无需等待
                const useFullSync = Math.random() < 0.2
                
                if (useFullSync) {
                    const { active, waiting, stopped } = await getAllTaskLists(1000)
                    taskStore.setTasks('active', active)
                    taskStore.setTasks('paused', waiting)
                    taskStore.setTasks('completed', stopped.filter(t => t.status === 'completed'))
                    
                    // 更新torrents列表缓存
                    const allTasks = [...active, ...waiting, ...stopped]
                    const torrentTasks = allTasks.filter(t => t.isTorrent)
                    taskStore.setTasks('torrents', torrentTasks)
                } else {
                    // 普通刷新只获取active列表，减少数据传输
                    const loadedTasks = await getActiveTasks()
                    taskStore.setTasks('active', loadedTasks)
                }
                break
            }
            case 'paused': {
                const loadedTasks = await getWaitingTasks(0, 50)
                taskStore.setTasks('paused', loadedTasks)
                break
            }
            case 'completed': {
                const stoppedTasks = await getStoppedTasks(0, 50)
                const completedTasks = stoppedTasks.filter(t => t.status === 'completed')
                taskStore.setTasks('completed', completedTasks)
                break
            }
            case 'torrents': {
                // 使用批量接口，一次请求获取所有列表，减少2个HTTP请求
                const { active, waiting, stopped } = await getAllTaskLists(1000)
                // 更新所有相关缓存
                taskStore.setTasks('active', active)
                taskStore.setTasks('paused', waiting)
                taskStore.setTasks('completed', stopped.filter(t => t.status === 'completed'))
                
                const allTasks = [...active, ...waiting, ...stopped]
                const torrentTasks = allTasks.filter(t => t.isTorrent)
                taskStore.setTasks('torrents', torrentTasks)
                break
            }
        }
    } catch (error) {
        console.error(`Failed to load ${type} tasks:`, error)
    }
}

// 加载当前类型任务
const loadTasks = () => {
    return loadTaskType(listType.value)
}

// 预加载其他列表（后台静默加载，不阻塞UI）
const preloadOtherLists = () => {
    const allTypes: ListType[] = ['active', 'paused', 'completed', 'torrents']
    const typesToLoad = allTypes.filter(t => t !== listType.value)
    
    // 延迟更长时间加载，等首屏完全渲染后再后台预加载
    // 使用requestIdleCallback在浏览器空闲时加载，如果不支持则用setTimeout
    const load = () => {
        typesToLoad.forEach((type, index) => {
            // 错开请求，避免并发请求太多
            setTimeout(() => {
                // 如果缓存中已经有数据，延后刷新
                const hasData = taskStore.getTaskCount(type).value > 0
                if (!hasData) {
                    loadTaskType(type)
                }
            }, index * 200)
        })
    }
    
    if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(load, { timeout: 2000 })
    } else {
        setTimeout(load, 800)
    }
}

// 启动刷新
const startRefresh = () => {
    if (refreshInterval) {
        clearInterval(refreshInterval)
        refreshInterval = null
    }
    
    // 初始化时加载一次当前列表数据
    loadTasks()
    
    // 下载中(active)和种子(torrents)页面需要定时刷新，更新任务进度和速度
    // 暂停(paused)/已完成(completed)页面不需要自动刷新
    if (listType.value === 'active' || listType.value === 'torrents') {
        refreshInterval = window.setInterval(loadTasks, refreshIntervalTime.value)
    }
    
    // 启动全局仪表盘自动刷新（全局只启动一次，用于速度和统计数据更新）
    dashboardStore.startAutoRefresh(5000)
}

// 停止刷新
const stopRefresh = () => {
    if (refreshInterval) {
        clearInterval(refreshInterval)
        refreshInterval = null
    }
    // 不停止dashboard刷新，让它全局保持运行
}

// 判断任务是否可以开始/暂停
const canStart = (task: Task) => task.status === 'paused' || task.status === 'waiting' || task.status === 'error'
const canPause = (task: Task) => task.status === 'downloading' || task.status === 'seeding' || task.status === 'waiting'
const isCompleted = (task: Task) => task.status === 'completed'

// 刷新所有列表（并行加载，更新所有缓存）
const refreshAllLists = async () => {
    await Promise.all([
        loadTaskType('active'),
        loadTaskType('paused'),
        loadTaskType('completed')
    ])
    // torrents依赖上面三个的数据，等它们完成再加载
    loadTaskType('torrents')
}

// 根据状态获取目标列表
const getTargetListType = (status: Task['status']): ListType => {
    if (status === 'downloading' || status === 'seeding') return 'active'
    if (status === 'paused' || status === 'waiting' || status === 'error') return 'paused'
    if (status === 'completed') return 'completed'
    return 'active'
}

// 移动任务到正确的列表
const moveTaskToCorrectList = (gid: string) => {
    // 先在所有列表中找到这个任务
    const task = taskStore.getTaskById(gid)
    if (!task) return
    
    // 从所有列表移除
    taskStore.removeTaskFromList(gid)
    
    // 添加到目标列表
    const targetList = getTargetListType(task.status)
    const targetTasks = taskStore.getTasks(targetList).value
    targetTasks.unshift(task)
}

// 事件处理
const onAddTask = () => {
    // 添加任务后刷新所有列表，确保各个页面都能看到
    refreshAllLists()
}

const onAddTaskWithData = async (_gids: string[]) => {
    refreshAllLists()
}

const onStartAll = async () => {
    // 乐观更新：立即更新状态并移动到active列表
    for (const task of currentTasks.value) {
        if (canStart(task)) {
            try {
                unpauseTask(task.id)
                task.status = 'downloading'
                task.downloadSpeed = 0
                task.uploadSpeed = 0
                moveTaskToCorrectList(task.id)
            } catch (error) {
                console.error('Failed to start task:', error)
            }
        }
    }
    // 后台刷新所有列表
    refreshAllLists()
}

const onPauseAll = async () => {
    for (const task of currentTasks.value) {
        if (canPause(task)) {
            try {
                pauseTask(task.id)
                task.status = 'paused'
                task.downloadSpeed = 0
                task.uploadSpeed = 0
                moveTaskToCorrectList(task.id)
            } catch (error) {
                console.error('Failed to pause task:', error)
            }
        }
    }
    // 后台刷新所有列表
    refreshAllLists()
}

// 删除单个任务（确认后）
const onConfirmDelete = async (id: string, deleteLocalFile: boolean) => {
    try {
        // 立即从缓存移除，UI马上更新
        taskStore.removeTaskFromList(id)
        const task = currentTasks.value.find(t => t.id === id)
        const forceDelete = task ? isCompleted(task) : false
        await removeTask(id, forceDelete, deleteLocalFile)
        // 后台刷新确保数据一致性
        refreshAllLists()
    } catch (error) {
        console.error('Failed to delete task:', error)
        // 删除失败回滚，重新加载
        refreshAllLists()
    }
}

// 删除选中任务（确认后）
const onConfirmDeleteSelected = async (ids: string[], deleteLocalFile: boolean) => {
    try {
        // 立即从缓存移除
        taskStore.removeTasksFromList(ids)
        for (const id of ids) {
            const task = currentTasks.value.find(t => t.id === id)
            const forceDelete = task ? isCompleted(task) : false
            removeTask(id, forceDelete, deleteLocalFile)
        }
        // 后台刷新
        refreshAllLists()
    } catch (error) {
        console.error('Failed to delete selected tasks:', error)
        refreshAllLists()
    }
}

// 删除所有任务（确认后）
const onConfirmDeleteAll = async (deleteLocalFile: boolean) => {
    try {
        // 清空当前缓存
        taskStore.setTasks(listType.value, [])
        for (const task of currentTasks.value) {
            const forceDelete = isCompleted(task)
            removeTask(task.id, forceDelete, deleteLocalFile)
        }
        // 后台刷新所有列表
        refreshAllLists()
    } catch (error) {
        console.error('Failed to delete all tasks:', error)
        refreshAllLists()
    }
}

// 以下是触发确认对话框的事件，实际删除在confirm事件中处理
const onDeleteAll = () => {
    // 已由TaskPage中的确认对话框处理
}

const onStart = async (id: string) => {
    try {
        // 乐观更新：立即更新状态并移动到对应列表
        const task = taskStore.getTaskById(id)
        if (task) {
            task.status = 'downloading'
            task.downloadSpeed = 0
            task.uploadSpeed = 0
            moveTaskToCorrectList(id)
        }
        await unpauseTask(id)
        // 后台刷新所有列表，确保数据一致
        refreshAllLists()
    } catch (error) {
        console.error('Failed to start task:', error)
        refreshAllLists()
    }
}

const onPause = async (id: string) => {
    try {
        // 乐观更新：立即更新状态并移动到对应列表
        const task = taskStore.getTaskById(id)
        if (task) {
            task.status = 'paused'
            task.downloadSpeed = 0
            task.uploadSpeed = 0
            moveTaskToCorrectList(id)
        }
        await pauseTask(id)
        // 后台刷新所有列表，确保数据一致
        refreshAllLists()
    } catch (error) {
        console.error('Failed to pause task:', error)
        refreshAllLists()
    }
}

const onDelete = () => {
    // 已由TaskPage中的确认对话框处理，不需要直接执行删除
}

const onOpenFolder = (id: string) => {
    console.log('Open folder', id)
}

const onOpenFile = (id: string) => {
    console.log('Open file', id)
}

onMounted(() => {
    startRefresh()
})

onActivated(() => {
    startRefresh()
})

onDeactivated(() => {
    stopRefresh()
})

onUnmounted(() => {
    stopRefresh()
})
</script>