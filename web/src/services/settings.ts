import { reactive, watch, onMounted } from 'vue'
import { getAuthHeaders } from './auth'
import { API_CONFIG } from '../config/api'
import {
    SettingKey,
    SettingValue,
    SettingsState,
    SettingConfig,
    DEFAULT_SETTINGS,
} from '../types/settings'
import { applyTheme, ThemeMode } from './theme'

// 开发模式跳过登录配置
const SKIP_LOGIN = import.meta.env.VITE_SKIP_LOGIN === 'true'

// 内部状态
const settings = reactive<SettingsState>({ ...DEFAULT_SETTINGS })
let isInitialized = false
let isLoading = false

// 类型转换帮助函数
function parseValue(value: string, key: SettingKey): SettingValue {
    const defaultValue = DEFAULT_SETTINGS[key]
    if (typeof defaultValue === 'boolean') {
        return value === 'true'
    } else if (typeof defaultValue === 'number') {
        return Number(value)
    }
    return value
}

function stringifyValue(value: SettingValue): string {
    return String(value)
}

// 从后端加载所有设置
async function loadSettingsFromServer(): Promise<void> {
    if (SKIP_LOGIN) {
        // 跳过登录模式，从本地加载
        loadFromLocalStorage()
        return
    }

    // 检查是否有 token
    const token = localStorage.getItem('authToken')
    if (!token) {
        loadFromLocalStorage()
        return
    }

    try {
        const headers = await getAuthHeaders()
        const response = await fetch(`${API_CONFIG.baseUrl}/user/configs`, {
            method: 'GET',
            headers,
        })

        if (response.ok) {
            const result = await response.json()
            if (result.success && result.configs) {
                // 合并服务器配置
                result.configs.forEach((config: SettingConfig) => {
                    const key = config.key as SettingKey
                    if (key in DEFAULT_SETTINGS) {
                        settings[key] = parseValue(config.value, key)
                    }
                })
            }
        }
    } catch (error) {
        console.error('Failed to load settings from server:', error)
        // 失败时尝试本地加载
        loadFromLocalStorage()
    }
}

// 保存单个设置到后端
async function saveSettingToServer(key: SettingKey, value: SettingValue): Promise<void> {
    if (SKIP_LOGIN) {
        // 跳过登录模式，保存到本地
        saveToLocalStorage()
        return
    }

    // 检查是否有 token
    const token = localStorage.getItem('authToken')
    if (!token) {
        saveToLocalStorage()
        return
    }

    try {
        const headers = await getAuthHeaders()
        await fetch(`${API_CONFIG.baseUrl}/user/config`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                key,
                value: stringifyValue(value),
            }),
        })
    } catch (error) {
        console.error('Failed to save setting to server:', error)
    }
}

// 本地存储操作
function loadFromLocalStorage(): void {
    try {
        const saved = localStorage.getItem('appSettings')
        if (saved) {
            const parsed = JSON.parse(saved)
            Object.assign(settings, DEFAULT_SETTINGS, parsed)
        }
    } catch (error) {
        console.error('Failed to load settings from localStorage:', error)
    }
}

function saveToLocalStorage(): void {
    try {
        localStorage.setItem('appSettings', JSON.stringify(settings))
    } catch (error) {
        console.error('Failed to save settings to localStorage:', error)
    }
}

// 监听设置变化，自动保存
let saveTimeout: ReturnType<typeof setTimeout> | null = null
watch(
    settings,
    () => {
        if (saveTimeout) {
            clearTimeout(saveTimeout)
        }

        // 防抖保存
        saveTimeout = setTimeout(async () => {
            saveToLocalStorage()
            // 异步保存到服务器
            for (const [key, value] of Object.entries(settings)) {
                await saveSettingToServer(key as SettingKey, value)
            }
        }, 500)
    },
    { deep: true }
)

// 监听主题变化，自动应用
watch(
    () => settings.theme,
    (newTheme) => {
        if (newTheme) {
            applyTheme(newTheme as ThemeMode)
        }
    }
)

// 初始化（内部函数）
async function initializeSettings(): Promise<void> {
    if (!isInitialized && !isLoading) {
        isLoading = true
        await loadSettingsFromServer()
        // 加载完设置后立即应用主题
        applyTheme(settings.theme as ThemeMode)
        isInitialized = true
        isLoading = false
    }
}

// 公共 API
export function useSettings() {
    function getSetting<K extends SettingKey>(key: K): SettingValue {
        return settings[key]
    }

    function setSetting<K extends SettingKey>(key: K, value: SettingValue): void {
        settings[key] = value
    }

    function resetSettings(): void {
        Object.assign(settings, { ...DEFAULT_SETTINGS })
    }

    async function refreshSettings(): Promise<void> {
        await loadSettingsFromServer()
    }

    // 在组件中使用时自动初始化
    onMounted(() => {
        initializeSettings()
    })

    return {
        settings,
        getSetting,
        setSetting,
        resetSettings,
        refreshSettings,
    }
}

// 同步获取设置的方法（用于不需要响应式的场景）
export function getSettingsSync(): SettingsState {
    return { ...settings }
}

// 暴露初始化函数，供外部调用
export async function initSettings(): Promise<void> {
    await initializeSettings()
}