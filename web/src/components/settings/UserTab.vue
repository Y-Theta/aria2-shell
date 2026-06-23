<template>
    <div class="user-tab">
        <div class="section-title">
            <i class="fas fa-lock section-title-icon" aria-hidden="true"></i>
            <span>{{ t('settings.user.changePassword') }}</span>
        </div>

        <SettingItem
            :label="t('settings.user.oldPassword')"
            :description="t('settings.user.oldPasswordDesc')"
            icon="fas fa-key"
        >
            <TextControl
                v-model="oldPassword"
                type="password"
                :placeholder="t('settings.user.oldPasswordPlaceholder')"
            />
        </SettingItem>

        <SettingItem
            :label="t('settings.user.newPassword')"
            :description="t('settings.user.newPasswordDesc')"
            icon="fas fa-key"
        >
            <TextControl
                v-model="newPassword"
                type="password"
                :placeholder="t('settings.user.newPasswordPlaceholder')"
            />
        </SettingItem>

        <SettingItem
            :label="t('settings.user.confirmPassword')"
            :description="t('settings.user.confirmPasswordDesc')"
            icon="fas fa-key"
        >
            <TextControl
                v-model="confirmPassword"
                type="password"
                :placeholder="t('settings.user.confirmPasswordPlaceholder')"
            />
        </SettingItem>

        <div v-if="errorMessage" class="error-message">
            <i class="fas fa-exclamation-circle" aria-hidden="true"></i>
            <span>{{ errorMessage }}</span>
        </div>

        <div v-if="successMessage" class="success-message">
            <i class="fas fa-check-circle" aria-hidden="true"></i>
            <span>{{ successMessage }}</span>
        </div>

        <button class="primary-button" type="button" @click="handleChangePassword" :disabled="isLoading">
            <i :class="isLoading ? 'fas fa-spinner fa-spin button-icon' : 'fas fa-save button-icon'" aria-hidden="true"></i>
            {{ t('settings.user.updatePassword') }}
        </button>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import SettingItem from './SettingItem.vue'
import TextControl from '../common/TextControl.vue'
import { getAuthHeaders } from '../../services/auth'
import { API_CONFIG } from '../../config/api'

const { t } = useI18n()

const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const emit = defineEmits<{
    (e: 'password-changed'): void
}>()

async function handleChangePassword() {
    errorMessage.value = ''
    successMessage.value = ''

    if (!oldPassword.value.trim()) {
        errorMessage.value = t('settings.user.oldPasswordRequired')
        return
    }

    if (!newPassword.value.trim()) {
        errorMessage.value = t('settings.user.newPasswordRequired')
        return
    }

    if (newPassword.value.length < 6) {
        errorMessage.value = t('settings.user.newPasswordTooShort')
        return
    }

    if (newPassword.value !== confirmPassword.value) {
        errorMessage.value = t('settings.user.passwordNotMatch')
        return
    }

    isLoading.value = true
    try {
        const headers = await getAuthHeaders()
        const response = await fetch(`${API_CONFIG.baseUrl}/user/change-password`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                oldPassword: oldPassword.value,
                newPassword: newPassword.value
            })
        })

        const result = await response.json()

        if (result.success) {
            successMessage.value = result.message
            // 清空表单
            oldPassword.value = ''
            newPassword.value = ''
            confirmPassword.value = ''
            // 触发密码修改成功事件
            setTimeout(() => {
                emit('password-changed')
            }, 1000)
        } else {
            errorMessage.value = result.message
        }
    } catch (error) {
        console.error('Change password error:', error)
        errorMessage.value = t('settings.user.changePasswordError')
    } finally {
        isLoading.value = false
    }
}
</script>

<style scoped>
.user-tab {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.section-title {
    margin: 4px 0 0;
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 8px;
}

.section-title-icon {
    color: var(--primary);
}

.error-message {
    padding: 12px 16px;
    background: rgba(220, 53, 69, 0.1);
    border: 1px solid var(--danger);
    border-radius: 8px;
    color: var(--danger);
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
}

.success-message {
    padding: 12px 16px;
    background: rgba(40, 167, 69, 0.1);
    border: 1px solid var(--success);
    border-radius: 8px;
    color: var(--success);
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
}

.primary-button {
    height: 40px;
    padding: 0 20px;
    border-radius: 9px;
    font-size: 14px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: none;
    color: var(--text-inverse);
    background: var(--primary);
}

.primary-button:hover:not(:disabled) {
    background: var(--primary-hover);
}

.primary-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.button-icon {
    width: 1em;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}
</style>