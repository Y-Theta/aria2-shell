<template>
    <div class="login-container">
        <div class="background-decoration">
            <div class="blob blob-1"></div>
            <div class="blob blob-2"></div>
            <div class="blob blob-3"></div>
        </div>

        <div class="login-card">
            <div class="login-header">
                <div class="app-logo">
                    <i class="fas fa-download"></i>
                </div>
                <h1 class="app-title">{{ t('common.appName') }}</h1>
                <p class="app-subtitle">{{ t('login.subtitle') }}</p>
            </div>

            <div class="login-form">
                <div v-if="showRegister" class="form-tabs">
                    <button
                        class="tab-button"
                        :class="{ active: isLoginMode }"
                        @click="isLoginMode = true"
                    >
                        {{ t('login.login') }}
                    </button>
                    <button
                        class="tab-button"
                        :class="{ active: !isLoginMode }"
                        @click="isLoginMode = false"
                    >
                        {{ t('login.register') }}
                    </button>
                </div>
                <div v-else class="form-title">
                    <h2>{{ t('login.login') }}</h2>
                </div>

                <form @submit.prevent="handleSubmit">
                    <div class="form-group">
                        <label for="username">
                            <i class="fas fa-user"></i>
                            {{ t('login.username') }}
                        </label>
                        <input
                            id="username"
                            v-model="username"
                            type="text"
                            :placeholder="t('login.usernamePlaceholder')"
                            required
                        />
                    </div>

                    <div class="form-group">
                        <label for="password">
                            <i class="fas fa-lock"></i>
                            {{ t('login.password') }}
                        </label>
                        <input
                            id="password"
                            v-model="password"
                            type="password"
                            :placeholder="t('login.passwordPlaceholder')"
                            required
                        />
                    </div>

                    <div v-if="errorMessage" class="error-message">
                        <i class="fas fa-exclamation-circle"></i>
                        {{ errorMessage }}
                    </div>

                    <button
                        type="submit"
                        class="submit-button"
                        :disabled="isLoading"
                    >
                        <i v-if="isLoading" class="fas fa-spinner fa-spin"></i>
                        <span v-else>
                            {{ (isLoginMode || !showRegister) ? t('login.login') : t('login.register') }}
                        </span>
                    </button>
                </form>

                <div class="login-footer">
                    <p>{{ t('login.footerText') }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuth } from '../services/auth'
import { useSettings } from '../services/settings'

const { t } = useI18n()
const router = useRouter()
const { login, register, isAuthenticated } = useAuth()

// 初始化设置服务
const { settings } = useSettings()

const showRegister = computed(() => {
    return settings.showRegister as boolean
})

const isLoginMode = ref(true)
const username = ref('')
const password = ref('')
const errorMessage = ref('')
const isLoading = ref(false)

// 如果已经登录，直接跳转
if (isAuthenticated.value) {
    router.push('/')
}

async function handleSubmit() {
    errorMessage.value = ''
    isLoading.value = true

    try {
        let result
        if (isLoginMode.value || !showRegister.value) {
            result = await login(username.value, password.value)
        } else {
            result = await register(username.value, password.value)
        }

        if (result.success) {
            // 登录/注册成功，跳转主页面
            await router.push('/')
        } else {
            errorMessage.value = result.error || 'Unknown error'
        }
    } catch (error) {
        console.error('Submit error:', error)
        errorMessage.value = 'Server error'
    } finally {
        isLoading.value = false
    }
}
</script>

<style scoped>
.login-container {
    position: relative;
    width: 100vw;
    height: 100vh;
    min-height: 100vh;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--page-bg) 0%, var(--bg-gray) 100%);
}

.background-decoration {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: 0;
}

.blob {
    position: absolute;
    border-radius: 50%;
    opacity: 0.15;
    animation: float 8s ease-in-out infinite;
}

.blob-1 {
    width: 500px;
    height: 500px;
    background: linear-gradient(135deg, var(--primary-blue), var(--primary-blue-hover));
    top: -150px;
    right: -150px;
    animation-delay: 0s;
}

.blob-2 {
    width: 400px;
    height: 400px;
    background: linear-gradient(135deg, var(--success-green), var(--primary-blue));
    bottom: -100px;
    left: -100px;
    animation-delay: 2s;
}

.blob-3 {
    width: 350px;
    height: 350px;
    background: linear-gradient(135deg, var(--warning-orange), var(--primary-blue));
    top: 40%;
    left: 10%;
    animation-delay: 4s;
}

@keyframes float {
    0%, 100% {
        transform: translate(0, 0) scale(1);
    }
    33% {
        transform: translate(30px, -30px) scale(1.05);
    }
    66% {
        transform: translate(-20px, 20px) scale(0.95);
    }
}

.login-card {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 480px;
    background-color: var(--panel-bg);
    border-radius: 24px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    overflow: hidden;
    backdrop-filter: blur(10px);
}

.login-header {
    padding: var(--spacing-2xl);
    text-align: center;
    background: linear-gradient(135deg, var(--primary-blue), var(--primary-blue-hover));
    color: var(--text-inverse);
    position: relative;
}

.login-header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.2), transparent),
                radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.15), transparent);
    pointer-events: none;
}

.app-logo {
    font-size: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 96px;
    height: 96px;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    border-radius: 24px;
    margin: 0 auto var(--spacing-lg);
    position: relative;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.3);
    animation: pulse 3s ease-in-out infinite;
    color: var(--text-inverse);
}

@keyframes pulse {
    0%, 100% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.05);
    }
}

.app-title {
    font-size: 36px;
    font-weight: 800;
    margin: 0;
    letter-spacing: -0.5px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    color: var(--text-inverse);
}

.app-subtitle {
    font-size: 16px;
    opacity: 0.95;
    margin: var(--spacing-md) 0 0;
    font-weight: 400;
    color: var(--text-inverse);
}

.login-form {
    padding: var(--spacing-2xl);
}

.form-tabs {
    display: flex;
    margin-bottom: var(--spacing-xl);
    border-radius: 12px;
    overflow: hidden;
    background-color: var(--bg-gray);
    padding: 4px;
}

.form-title {
    text-align: center;
    margin-bottom: var(--spacing-xl);
}

.form-title h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
    color: var(--text-primary);
}

.tab-button {
    flex: 1;
    padding: var(--spacing-md);
    border: none;
    background-color: transparent;
    color: var(--text-secondary);
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    border-radius: 8px;
}

.tab-button:hover {
    background-color: rgba(31, 111, 235, 0.08);
    color: var(--primary-blue);
}

.tab-button.active {
    background-color: var(--panel-bg);
    color: var(--primary-blue);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.form-group {
    margin-bottom: var(--spacing-xl);
}

.form-group label {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-md);
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    letter-spacing: 0.3px;
}

.form-group input {
    width: 100%;
    padding: 16px 20px;
    border: 2px solid var(--border-gray);
    border-radius: 12px;
    font-size: 16px;
    background-color: var(--input-bg);
    color: var(--input-color);
    transition: all 0.3s ease;
    font-weight: 500;
}

.form-group input:focus {
    outline: none;
    border-color: var(--primary-blue);
    box-shadow: 0 0 0 4px rgba(31, 111, 235, 0.1),
                0 8px 16px rgba(0, 0, 0, 0.05);
    transform: translateY(-1px);
}

.form-group input::placeholder {
    color: var(--input-placeholder);
}

.error-message {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: 14px 18px;
    margin-bottom: var(--spacing-xl);
    background: linear-gradient(135deg, rgba(220, 53, 69, 0.1), rgba(220, 53, 69, 0.05));
    color: var(--error-red);
    border-radius: 12px;
    font-size: 14px;
    font-weight: 500;
    border: 1px solid rgba(220, 53, 69, 0.2);
    animation: shake 0.5s ease-in-out;
}

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
}

.submit-button {
    width: 100%;
    padding: 18px 32px;
    background: linear-gradient(135deg, var(--primary-blue), var(--primary-blue-hover));
    color: var(--text-inverse);
    border: none;
    border-radius: 12px;
    font-size: 17px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
    letter-spacing: 0.3px;
    box-shadow: 0 4px 15px rgba(31, 111, 235, 0.3);
}

.submit-button:hover:not(:disabled) {
    background: linear-gradient(135deg, var(--primary-blue-hover), var(--primary-blue));
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(31, 111, 235, 0.4);
}

.submit-button:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(31, 111, 235, 0.3);
}

.submit-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.login-footer {
    text-align: center;
    margin-top: var(--spacing-2xl);
    padding-top: var(--spacing-xl);
    border-top: 1px solid var(--border-gray);
}

.login-footer p {
    font-size: 14px;
    color: var(--text-muted);
    margin: 0;
    font-weight: 500;
    letter-spacing: 0.3px;
}

@media (max-width: 768px) {
    .login-container {
        padding: var(--spacing-lg);
        height: 100dvh;
        min-height: 100dvh;
    }
    
    .login-card {
        max-width: 100%;
        border-radius: 20px;
    }
    
    .login-header {
        padding: var(--spacing-xl);
    }
    
    .app-logo {
        width: 80px;
        height: 80px;
        font-size: 44px;
        border-radius: 20px;
    }
    
    .app-title {
        font-size: 28px;
    }
    
    .app-subtitle {
        font-size: 14px;
    }
    
    .login-form {
        padding: var(--spacing-xl);
    }
    
    .blob-1 {
        width: 300px;
        height: 300px;
        top: -100px;
        right: -100px;
    }
    
    .blob-2 {
        width: 250px;
        height: 250px;
        bottom: -80px;
        left: -80px;
    }
    
    .blob-3 {
        width: 200px;
        height: 200px;
    }
}
</style>