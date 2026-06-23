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
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettings } from '../../services/settings'
import SettingItem from './SettingItem.vue'
import TextControl from './TextControl.vue'
import NumberControl from './NumberControl.vue'
import SwitchControl from './SwitchControl.vue'

const { t } = useI18n()
const settingsService = useSettings()
const settings = settingsService.settings

const aria2ServerUrl = ref<string>((settings.serverUrl as string) || '')
const aria2Secret = ref<string>('')
const timeout = ref<number>((settings.timeout as number) || 10)
const autoReconnect = ref<boolean>((settings.autoReconnect as boolean) || true)

watch(aria2ServerUrl, (value) => {
    settingsService.setSetting('serverUrl', value)
})

watch(timeout, (value) => {
    settingsService.setSetting('timeout', value)
})

watch(autoReconnect, (value) => {
    settingsService.setSetting('autoReconnect', value)
})
</script>

<style scoped>
.aria2-tab {
    display: flex;
    flex-direction: column;
    gap: 14px;
}
</style>