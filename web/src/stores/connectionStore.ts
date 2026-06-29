import { reactive, computed } from 'vue'
import { API_CONFIG } from '../config/api'
import { getAuthHeaders } from '../services/auth'

interface ConnectionState {
    connected: boolean
    version?: string
    features?: string[]
    error?: string
    lastChecked: number
    checking: boolean
}

const state = reactive<ConnectionState>({
    connected: false,
    lastChecked: 0,
    checking: false
})

let checkInterval: number | null = null

export function useConnectionStore() {
    const isConnected = computed(() => state.connected)
    const version = computed(() => state.version)
    const isChecking = computed(() => state.checking)
    const errorMessage = computed(() => state.error)

    const checkConnection = async () => {
        if (state.checking) return
        state.checking = true
        
        try {
            const response = await fetch(`${API_CONFIG.baseUrl}/aria2/connection-status`, {
                headers: getAuthHeaders()
            })
            
            if (response.ok) {
                const data = await response.json()
                state.connected = data.connected
                state.version = data.version
                state.features = data.features
                state.error = data.error
                state.lastChecked = Date.now()
            } else {
                state.connected = false
                state.error = 'Failed to check connection'
            }
        } catch (error) {
            state.connected = false
            state.error = (error as Error).message
        } finally {
            state.checking = false
        }
    }

    const startMonitoring = () => {
        if (checkInterval) return
        // 立即检查一次
        checkConnection()
        // 每10秒检查一次
        checkInterval = window.setInterval(checkConnection, 10000)
    }

    const stopMonitoring = () => {
        if (checkInterval) {
            clearInterval(checkInterval)
            checkInterval = null
        }
    }

    const setDisconnected = (error?: string) => {
        state.connected = false
        state.error = error
        // 立即触发重新检查
        setTimeout(checkConnection, 1000)
    }

    const setConnected = (version?: string) => {
        state.connected = true
        state.version = version
        state.error = undefined
        state.lastChecked = Date.now()
    }

    return {
        state,
        isConnected,
        version,
        isChecking,
        errorMessage,
        checkConnection,
        startMonitoring,
        stopMonitoring,
        setDisconnected,
        setConnected
    }
}