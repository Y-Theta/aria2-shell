<template>
    <div class="appearance-tab">
        <SettingItem
            :label="t('settings.appearance.theme.label')"
            :description="t('settings.appearance.theme.desc')"
            icon="fas fa-swatchbook"
        >
            <CustomSelect
                v-model="theme"
                :options="themeOptions"
            />
        </SettingItem>

        <SettingItem
            :label="t('settings.appearance.language.label')"
            :description="t('settings.appearance.language.desc')"
            icon="fas fa-language"
        >
            <CustomSelect
                v-model="language"
                :options="languageOptions"
            />
        </SettingItem>


    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettings } from '../../services/settings'
import SettingItem from './SettingItem.vue'
import CustomSelect from '../common/CustomSelect.vue'

const { t } = useI18n()
const settingsService = useSettings()
const settings = settingsService.settings

const theme = ref<string>((settings.theme as string) || 'light')
const language = ref<string>((settings.language as string) || 'zh-CN')

const themeOptions = computed(() => [
    { value: 'light', label: t('settings.appearance.theme.light') },
    { value: 'dark', label: t('settings.appearance.theme.dark') },
    { value: 'system', label: t('settings.appearance.theme.system') },
])

const languageOptions = computed(() => [
    { value: 'zh-CN', label: t('settings.appearance.language.zhCN') },
    { value: 'en-US', label: t('settings.appearance.language.enUS') },
])

watch(theme, (value) => {
    settingsService.setSetting('theme', value)
})

watch(language, (value) => {
    settingsService.setSetting('language', value)
})
</script>

<style scoped>
.appearance-tab {
    display: flex;
    flex-direction: column;
    gap: 14px;
}
</style>