<template>
    <div class="aria2-tab">
        <SettingItem
            :label="t('settings.aria2.serverUrl.label')"
            :description="t('settings.aria2.serverUrl.desc')"
            icon="fas fa-server"
        >
            <TextControl
                v-model="aria2ServerUrl"
                :placeholder="t('settings.aria2.serverUrl.placeholder')"
            />
        </SettingItem>

        <SettingItem
            :label="t('settings.aria2.secret.label')"
            :description="t('settings.aria2.secret.desc')"
            icon="fas fa-key"
        >
            <TextControl
                v-model="aria2Secret"
                type="password"
                :placeholder="t('settings.aria2.secret.placeholder')"
            />
        </SettingItem>

        <SettingItem
            :label="t('settings.aria2.timeout.label')"
            :description="t('settings.aria2.timeout.desc')"
            icon="fas fa-stopwatch"
        >
            <NumberControl
                v-model="timeout"
                :min="1"
                :max="120"
            />
        </SettingItem>

        <SettingItem
            :label="t('settings.aria2.autoReconnect.label')"
            :description="t('settings.aria2.autoReconnect.desc')"
            icon="fas fa-rotate-right"
        >
            <SwitchControl
                v-model="autoReconnect"
            />
        </SettingItem>

        <div class="section-title">
            <i class="fas fa-magnet section-title-icon" aria-hidden="true"></i>
            <span>{{ t('settings.aria2.btSection') }}</span>
        </div>

        <SettingItem
            :label="t('settings.aria2.btTrackerUrl.label')"
            :description="t('settings.aria2.btTrackerUrl.desc')"
            icon="fas fa-link"
        >
            <TextareaControl
                v-model="btTrackerUrl"
                :placeholder="t('settings.aria2.btTrackerUrl.placeholder')"
                :rows="4"
            />
        </SettingItem>

        <SettingItem
            :label="t('settings.aria2.btMaxUploadSpeed.label')"
            :description="t('settings.aria2.btMaxUploadSpeed.desc')"
            icon="fas fa-arrow-up"
        >
            <NumberControl
                v-model="btMaxUploadSpeed"
                :min="0"
            />
        </SettingItem>

        <SettingItem
            :label="t('settings.aria2.btMinSeedRatio.label')"
            :description="t('settings.aria2.btMinSeedRatio.desc')"
            icon="fas fa-percent"
        >
            <NumberControl
                v-model="btMinSeedRatio"
                :min="0"
                :step="0.1"
            />
        </SettingItem>

        <SettingItem
            :label="t('settings.aria2.btMinSeedTime.label')"
            :description="t('settings.aria2.btMinSeedTime.desc')"
            icon="fas fa-clock"
        >
            <NumberControl
                v-model="btMinSeedTime"
                :min="0"
            />
        </SettingItem>

        <div class="section-title">
            <i class="fas fa-network-wired section-title-icon" aria-hidden="true"></i>
            <span>{{ t('settings.aria2.httpProxySection') }}</span>
        </div>

        <SettingItem
            :label="t('settings.aria2.httpProxyUrl.label')"
            :description="t('settings.aria2.httpProxyUrl.desc')"
            icon="fas fa-globe"
        >
            <TextControl
                v-model="httpProxyUrl"
                :placeholder="t('settings.aria2.httpProxyUrl.placeholder')"
            />
        </SettingItem>

        <div class="proxy-auth-row">
            <SettingItem
                :label="t('settings.aria2.httpProxyUser.label')"
                :description="t('settings.aria2.httpProxyUser.desc')"
                icon="fas fa-user"
                class="proxy-auth-item"
            >
                <TextControl
                    v-model="httpProxyUser"
                    :placeholder="t('settings.aria2.httpProxyUser.placeholder')"
                />
            </SettingItem>

            <SettingItem
                :label="t('settings.aria2.httpProxyPassword.label')"
                :description="t('settings.aria2.httpProxyPassword.desc')"
                icon="fas fa-key"
                class="proxy-auth-item"
            >
                <TextControl
                    v-model="httpProxyPassword"
                    type="password"
                    :placeholder="t('settings.aria2.httpProxyPassword.placeholder')"
                />
            </SettingItem>
        </div>

        <SettingItem
            :label="t('settings.aria2.proxyTestUrl.label')"
            :description="t('settings.aria2.proxyTestUrl.desc')"
            icon="fas fa-link"
        >
            <div class="test-proxy-row">
                <TextControl
                    v-model="proxyTestUrl"
                    :placeholder="t('settings.aria2.proxyTestUrl.placeholder')"
                />
                <button 
                    class="test-proxy-button" 
                    type="button" 
                    @click="testProxyConnection" 
                    :disabled="testingProxy || !httpProxyUrl"
                >
                    <i :class="testingProxy ? 'fas fa-spinner fa-spin button-icon' : 'fas fa-vial button-icon'" aria-hidden="true"></i>
                    {{ t('settings.aria2.testProxyConnection.buttonText') }}
                </button>
            </div>
        </SettingItem>

        <div v-if="proxyTestResult === 'success'" class="success-message">
            <i class="fas fa-check-circle" aria-hidden="true"></i>
            <span>{{ t('settings.aria2.proxyTestSuccess', { elapsed: proxyTestElapsed, status: proxyTestStatus }) }}</span>
        </div>

        <div v-if="proxyTestResult === 'error'" class="error-message">
            <i class="fas fa-exclamation-circle" aria-hidden="true"></i>
            <span>{{ proxyTestError }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettings } from '../../services/settings'
import SettingItem from './SettingItem.vue'
import TextControl from '../common/TextControl.vue'
import TextareaControl from '../common/TextareaControl.vue'
import NumberControl from '../common/NumberControl.vue'
import SwitchControl from '../common/SwitchControl.vue'
import { getAuthHeaders } from '../../services/auth'
import { API_CONFIG } from '../../config/api'

const { t } = useI18n()
const settingsService = useSettings()
const settings = settingsService.settings

const aria2ServerUrl = ref<string>((settings.serverUrl as string) || '')
const aria2Secret = ref<string>((settings.secret as string) || '')
const timeout = ref<number>((settings.timeout as number) || 10)
const autoReconnect = ref<boolean>((settings.autoReconnect as boolean) || true)

const btTrackerUrl = ref<string>((settings.btTrackerUrl as string) || '')
const btMaxUploadSpeed = ref<number>((settings.btMaxUploadSpeed as number) || 0)
const btMinSeedRatio = ref<number>((settings.btMinSeedRatio as number) || 1.0)
const btMinSeedTime = ref<number>((settings.btMinSeedTime as number) || 60)

const httpProxyUrl = ref<string>((settings.httpProxyUrl as string) || '')
const httpProxyUser = ref<string>((settings.httpProxyUser as string) || '')
const httpProxyPassword = ref<string>((settings.httpProxyPassword as string) || '')
const proxyTestUrl = ref<string>('https://www.google.com/generate_204')
const testingProxy = ref(false)
const proxyTestResult = ref<'success' | 'error' | ''>('')
const proxyTestError = ref('')
const proxyTestElapsed = ref('')
const proxyTestStatus = ref('')

watch(aria2ServerUrl, (value) => {
    settingsService.setSetting('serverUrl', value)
})

watch(aria2Secret, (value) => {
    settingsService.setSetting('secret', value)
})

watch(timeout, (value) => {
    settingsService.setSetting('timeout', value)
})

watch(autoReconnect, (value) => {
    settingsService.setSetting('autoReconnect', value)
})

watch(btTrackerUrl, (value) => {
    settingsService.setSetting('btTrackerUrl', value)
})

watch(btMaxUploadSpeed, (value) => {
    settingsService.setSetting('btMaxUploadSpeed', value)
})

watch(btMinSeedRatio, (value) => {
    settingsService.setSetting('btMinSeedRatio', value)
})

watch(btMinSeedTime, (value) => {
    settingsService.setSetting('btMinSeedTime', value)
})

watch(httpProxyUrl, (value) => {
    settingsService.setSetting('httpProxyUrl', value)
})

watch(httpProxyUser, (value) => {
    settingsService.setSetting('httpProxyUser', value)
})

watch(httpProxyPassword, (value) => {
    settingsService.setSetting('httpProxyPassword', value)
})

async function testProxyConnection() {
    if (!httpProxyUrl.value) return
    
    testingProxy.value = true
    proxyTestResult.value = ''
    proxyTestError.value = ''
    
    try {
        const headers = getAuthHeaders()
        const response = await fetch(`${API_CONFIG.baseUrl}/proxy/test`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                proxyUrl: httpProxyUrl.value,
                proxyUser: httpProxyUser.value || undefined,
                proxyPassword: httpProxyPassword.value || undefined,
                testUrl: proxyTestUrl.value || 'https://www.google.com/generate_204'
            })
        })

        const result = await response.json()

        if (result.success) {
            proxyTestResult.value = 'success'
            proxyTestElapsed.value = result.elapsed || ''
            proxyTestStatus.value = String(result.status || '')
        } else {
            proxyTestResult.value = 'error'
            proxyTestError.value = result.message || t('settings.aria2.proxyTestFailed')
        }
    } catch (error) {
        console.error('Proxy test error:', error)
        proxyTestResult.value = 'error'
        proxyTestError.value = t('settings.aria2.proxyTestNetworkError')
    } finally {
        testingProxy.value = false
    }
}
</script>

<style scoped>
.aria2-tab {
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

.proxy-auth-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
}

.proxy-auth-item {
    margin: 0;
}

.test-proxy-row {
    display: flex;
    gap: 10px;
    width: 100%;
}

.test-proxy-row .text-input {
    flex: 1;
}

.test-proxy-button {
    height: 38px;
    padding: 0 16px;
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
    white-space: nowrap;
    flex-shrink: 0;
    transition: background 0.2s;
}

.test-proxy-button:hover:not(:disabled) {
    background: var(--primary-hover);
}

.test-proxy-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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

.button-icon {
    width: 1em;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

@media (max-width: 768px) {
    .proxy-auth-row {
        grid-template-columns: 1fr;
    }

    .test-proxy-row {
        flex-direction: column;
    }
}
</style>