import { ref, computed } from 'vue'
import { API_CONFIG } from '../config/api'

// 开发模式跳过登录配置
const SKIP_LOGIN = import.meta.env.VITE_SKIP_LOGIN === 'true'

const user = ref<{ id: number; username: string } | null>(null)
const token = ref<string | null>(localStorage.getItem('authToken'))

const isAuthenticated = computed(() => {
    if (SKIP_LOGIN) {
        return true
    }
    return !!token.value && !!user.value
})

// 初始化时检查本地存储
if (token.value && !user.value) {
    // 如果有token但没有用户信息，尝试从localStorage恢复
    const savedUser = localStorage.getItem('authUser')
    if (savedUser) {
        try {
            user.value = JSON.parse(savedUser)
        } catch {
            // 忽略
        }
    }
}

async function login(username: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
        // 调用后端登录API
        const response = await fetch(`${API_CONFIG.baseUrl}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        })

        const result = await response.json()

        if (result.success) {
            user.value = result.user
            token.value = result.token

            // 保存到本地存储
            localStorage.setItem('authToken', result.token)
            localStorage.setItem('authUser', JSON.stringify(result.user))

            return { success: true }
        } else {
            return { success: false, error: result.error || 'Login failed' }
        }
    } catch (error) {
        console.error('Login error:', error)
        return { success: false, error: 'Network error' }
    }
}

async function register(username: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
        const response = await fetch(`${API_CONFIG.baseUrl}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        })

        const result = await response.json()

        if (result.success) {
            // 注册成功，自动登录
            return await login(username, password)
        } else {
            return { success: false, error: result.error || 'Registration failed' }
        }
    } catch (error) {
        console.error('Registration error:', error)
        return { success: false, error: 'Network error' }
    }
}

function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
}

export function useAuth() {
    return {
        user,
        token,
        isAuthenticated,
        login,
        register,
        logout,
    }
}

export function getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    }

    if (SKIP_LOGIN) {
        return headers
    }

    if (token.value) {
        headers['Authorization'] = `Bearer ${token.value}`
    }

    return headers
}