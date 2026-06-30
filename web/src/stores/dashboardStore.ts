import { reactive, computed, watch } from 'vue'
import { getDashboard } from '../services/aria2'
import { useAuth } from '../services/auth'

interface DiskSpace {
    path: string
    total: number
    free: number
    available: number
    used: number
}

interface DashboardState {
    connected: boolean
    version: string | undefined
    error: string | undefined
    downloadSpeed: number
    uploadSpeed: number
    numActive: number
    numWaiting: number
    numStopped: number
    diskSpace: DiskSpace
    lastUpdated: number
}

const state = reactive<DashboardState>({
    connected: false,
    version: undefined,
    error: undefined,
    downloadSpeed: 0,
    uploadSpeed: 0,
    numActive: 0,
    numWaiting: 0,
    numStopped: 0,
    diskSpace: {
        path: '',
        total: 0,
        free: 0,
        available: 0,
        used: 0
    },
    lastUpdated: 0
})

let refreshTimer: number | null = null
let isStarted = false
let currentInterval = 5000
const { isAuthenticated } = useAuth()

// 监听登录状态变化（模块作用域，只创建一次）
watch(isAuthenticated, (authenticated) => {
    if (authenticated) {
        // 登录后，如果已经调用过startAutoRefresh，重新启动定时器
        if (isStarted && !refreshTimer) {
            fetchDashboardData()
            refreshTimer = window.setInterval(fetchDashboardData, currentInterval)
        }
    } else {
        // 登出时停止定时器
        if (refreshTimer) {
            clearInterval(refreshTimer)
            refreshTimer = null
        }
        // 重置状态
        Object.assign(state, {
            connected: false,
            version: undefined,
            error: undefined,
            downloadSpeed: 0,
            uploadSpeed: 0,
            numActive: 0,
            numWaiting: 0,
            numStopped: 0,
            diskSpace: {
                path: '',
                total: 0,
                free: 0,
                available: 0,
                used: 0
            },
            lastUpdated: 0
        })
    }
})

// 获取最新仪表盘数据并更新状态
export const fetchDashboardData = async (): Promise<void> => {
    // 未登录时不请求接口
    if (!isAuthenticated.value) {
        return
    }
    
    try {
        const data = await getDashboard()
        Object.assign(state, {
            connected: data.connected,
            version: data.version,
            error: data.error,
            downloadSpeed: data.downloadSpeed,
            uploadSpeed: data.uploadSpeed,
            numActive: data.numActive,
            numWaiting: data.numWaiting,
            numStopped: data.numStopped,
            diskSpace: data.diskSpace,
            lastUpdated: Date.now()
        })
    } catch (error) {
        console.warn('Failed to fetch dashboard data:', error)
        state.error = (error as Error).message
    }
}

export function useDashboardStore() {
    const updateDashboard = (data: Partial<DashboardState>) => {
        Object.assign(state, data, { lastUpdated: Date.now() })
    }

    const isConnected = computed(() => state.connected)
    const getVersion = computed(() => state.version)
    const getDownloadSpeed = computed(() => state.downloadSpeed)
    const getUploadSpeed = computed(() => state.uploadSpeed)
    const getActiveCount = computed(() => state.numActive)
    const getWaitingCount = computed(() => state.numWaiting)
    const getStoppedCount = computed(() => state.numStopped)
    const getDiskSpace = computed(() => state.diskSpace.available)
    const getDiskSpaceInfo = computed(() => state.diskSpace)
    const getError = computed(() => state.error)

    const startAutoRefresh = (intervalMs: number = 5000) => {
        currentInterval = intervalMs
        if (isStarted) {
            return
        }
        isStarted = true
        // 未登录时不立即请求，等登录后由watch自动启动
        if (isAuthenticated.value) {
            fetchDashboardData()
            refreshTimer = window.setInterval(fetchDashboardData, intervalMs)
        }
    }

    const stopAutoRefresh = () => {
        if (refreshTimer) {
            clearInterval(refreshTimer)
            refreshTimer = null
            isStarted = false
        }
    }

    const refreshNow = () => {
        return fetchDashboardData()
    }

    return {
        state,
        updateDashboard,
        isConnected,
        getVersion,
        getDownloadSpeed,
        getUploadSpeed,
        getActiveCount,
        getWaitingCount,
        getStoppedCount,
        getDiskSpace,
        getDiskSpaceInfo,
        getError,
        startAutoRefresh,
        stopAutoRefresh,
        refreshNow
    }
}