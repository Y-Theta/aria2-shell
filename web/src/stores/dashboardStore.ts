import { reactive, computed } from 'vue'
import { getDashboard } from '../services/aria2'

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

// 获取最新仪表盘数据并更新状态
export const fetchDashboardData = async (): Promise<void> => {
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
        if (isStarted) {
            return
        }
        isStarted = true
        // 立即获取一次数据
        fetchDashboardData()
        refreshTimer = window.setInterval(fetchDashboardData, intervalMs)
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