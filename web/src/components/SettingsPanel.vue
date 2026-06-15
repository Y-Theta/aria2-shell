<template>
    <teleport to="body">
        <transition name="settings-mask-fade">
            <div v-if="visible" class="settings-mask" @click="close" />
        </transition>

        <transition name="settings-slide">
            <aside v-if="visible" class="settings-drawer">
                <header class="settings-header">
                    <div>
                        <h2 class="settings-title">
                            <i class="fas fa-gear settings-title-icon" aria-hidden="true"></i>
                            <span>{{ t('settings.title') }}</span>
                        </h2>
                        <p class="settings-subtitle">{{ t('settings.subtitle') }}</p>
                    </div>

                    <button class="settings-close" type="button" :aria-label="t('common.close')" @click="close">
                        <i class="fas fa-xmark" aria-hidden="true"></i>
                    </button>
                </header>

                <nav class="settings-tabs">
                    <button v-for="tab in tabs" :key="tab.key" class="settings-tab"
                        :class="{ active: activeTab === tab.key }" type="button" @click="activeTab = tab.key">
                        <i class="settings-tab-icon" :class="tab.icon" aria-hidden="true"></i>
                        <span>{{ t(tab.labelKey) }}</span>
                    </button>
                </nav>

                <main class="settings-body">
                    <section v-for="tab in configurableTabs" v-show="activeTab === tab.key" :key="tab.key"
                        class="settings-section">
                        <h3 class="section-title">
                            <i class="section-title-icon" :class="tab.icon" aria-hidden="true"></i>
                            <span>{{ t(tab.titleKey) }}</span>
                        </h3>

                        <div v-for="item in tab.items" :key="item.key" class="setting-item"
                            :class="{ vertical: isVerticalItem(item) }">
                            <div class="setting-info">
                                <div class="setting-label">
                                    <i v-if="item.icon" class="setting-label-icon" :class="item.icon"
                                        aria-hidden="true"></i>
                                    <span>{{ t(item.labelKey) }}</span>
                                </div>
                                <div class="setting-desc">{{ t(item.descKey) }}</div>
                            </div>

                            <!-- switch -->
                            <label v-if="item.type === 'switch'" class="switch">
                                <input :checked="Boolean(settings[item.key])" type="checkbox"
                                    @change="setSettingValue(item.key, ($event.target as HTMLInputElement).checked)">
                                <span />
                            </label>

                            <!-- text -->
                            <input v-else-if="item.type === 'text'" :value="String(settings[item.key] ?? '')"
                                class="setting-input" type="text"
                                :placeholder="item.placeholderKey ? t(item.placeholderKey) : ''"
                                @input="setSettingValue(item.key, ($event.target as HTMLInputElement).value)">

                            <!-- number -->
                            <input v-else-if="item.type === 'number'" :value="Number(settings[item.key] ?? 0)"
                                class="number-input" type="number" :min="item.min" :max="item.max"
                                :placeholder="item.placeholderKey ? t(item.placeholderKey) : ''"
                                @input="setSettingValue(item.key, Number(($event.target as HTMLInputElement).value))">

                            <!-- select -->
                            <select v-else-if="item.type === 'select'" :value="String(settings[item.key] ?? '')"
                                class="setting-select"
                                @change="setSettingValue(item.key, ($event.target as HTMLSelectElement).value)">
                                <option v-for="option in item.options || []" :key="option.value" :value="option.value">
                                    {{ t(option.labelKey) }}
                                </option>
                            </select>

                            <!-- path -->
                            <div v-else-if="item.type === 'path'" class="path-row">
                                <input :value="String(settings[item.key] ?? '')" class="setting-input" type="text"
                                    :placeholder="item.placeholderKey ? t(item.placeholderKey) : ''"
                                    @input="setSettingValue(item.key, ($event.target as HTMLInputElement).value)">
                                <button class="secondary-button" type="button" @click="selectPath(item.key)">
                                    <i class="fas fa-folder-open button-icon" aria-hidden="true"></i>
                                    {{ t('settings.actions.select') }}
                                </button>
                            </div>
                        </div>
                    </section>

                    <!-- 关于 -->
                    <section v-show="activeTab === 'about'" class="settings-section">
                        <h3 class="section-title">
                            <i class="fas fa-circle-info section-title-icon" aria-hidden="true"></i>
                            <span>{{ t('settings.about.title') }}</span>
                        </h3>

                        <div class="about-card">
                            <div class="about-logo">
                                <i class="fas fa-download" aria-hidden="true"></i>
                            </div>
                            <div>
                                <div class="about-title">{{ t('settings.about.appName') }}</div>
                                <div class="about-desc">{{ t('settings.about.appDesc') }}</div>
                            </div>
                        </div>

                        <div class="info-list">
                            <div v-for="row in aboutInfoRows" :key="row.labelKey" class="info-row">
                                <span>
                                    <i v-if="row.icon" class="info-row-icon" :class="row.icon" aria-hidden="true"></i>
                                    {{ t(row.labelKey) }}
                                </span>
                                <strong :class="{ success: row.type === 'success' }">
                                    {{ t(row.valueKey) }}
                                </strong>
                            </div>
                        </div>

                        <button class="danger-button reset-in-page" type="button" @click="resetSettings">
                            <i class="fas fa-rotate-left button-icon" aria-hidden="true"></i>
                            {{ t('settings.actions.resetDefault') }}
                        </button>
                    </section>
                </main>

                <footer class="settings-footer">
                    <button class="primary-button" type="button" @click="saveSettings">
                        <i class="fas fa-floppy-disk button-icon" aria-hidden="true"></i>
                        {{ t('settings.actions.save') }}
                    </button>
                </footer>
            </aside>
        </transition>
    </teleport>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

type SettingValue = string | number | boolean
type SettingType = 'switch' | 'text' | 'number' | 'select' | 'path'
type SettingKey =
    | 'autoStart'
    | 'minimizeToTray'
    | 'downloadPath'
    | 'maxActiveDownloads'
    | 'downloadLimit'
    | 'uploadLimit'
    | 'keepSeeding'
    | 'serverUrl'
    | 'timeout'
    | 'autoReconnect'
    | 'theme'
    | 'language'
    | 'compactMode'

interface SettingOption {
    labelKey: string
    value: string | number
}

interface SettingItem {
    key: SettingKey
    type: SettingType
    labelKey: string
    descKey: string
    icon?: string
    placeholderKey?: string
    min?: number
    max?: number
    options?: SettingOption[]
}

interface SettingTab {
    key: string
    labelKey: string
    titleKey: string
    icon: string
    items: SettingItem[]
}

interface AboutInfoRow {
    labelKey: string
    valueKey: string
    icon?: string
    type?: 'success'
}

const { t } = useI18n()

const props = defineProps<{
    visible: boolean
}>()

const emit = defineEmits<{
    'update:visible': [value: boolean]
}>()

const activeTab = ref('general')

const defaultSettings: Record<SettingKey, SettingValue> = {
    autoStart: false,
    minimizeToTray: true,
    downloadPath: '',
    maxActiveDownloads: 5,
    downloadLimit: 0,
    uploadLimit: 0,
    keepSeeding: true,
    serverUrl: 'http://127.0.0.1:8080',
    timeout: 10,
    autoReconnect: true,
    theme: 'light',
    language: 'zh-CN',
    compactMode: false,
}

const settings = reactive<Record<SettingKey, SettingValue>>({ ...defaultSettings })

const tabs: SettingTab[] = [
    {
        key: 'general',
        labelKey: 'settings.tabs.general',
        titleKey: 'settings.sections.general',
        icon: 'fas fa-sliders',
        items: [
            {
                key: 'autoStart',
                type: 'switch',
                labelKey: 'settings.general.autoStart.label',
                descKey: 'settings.general.autoStart.desc',
                icon: 'fas fa-power-off',
            },
            {
                key: 'minimizeToTray',
                type: 'switch',
                labelKey: 'settings.general.minimizeToTray.label',
                descKey: 'settings.general.minimizeToTray.desc',
                icon: 'fas fa-window-minimize',
            },
            {
                key: 'downloadPath',
                type: 'path',
                labelKey: 'settings.general.downloadPath.label',
                descKey: 'settings.general.downloadPath.desc',
                icon: 'fas fa-folder',
                placeholderKey: 'settings.general.downloadPath.placeholder',
            },
        ],
    },
    {
        key: 'download',
        labelKey: 'settings.tabs.download',
        titleKey: 'settings.sections.download',
        icon: 'fas fa-download',
        items: [
            {
                key: 'maxActiveDownloads',
                type: 'number',
                labelKey: 'settings.download.maxActiveDownloads.label',
                descKey: 'settings.download.maxActiveDownloads.desc',
                icon: 'fas fa-layer-group',
                min: 1,
                max: 20,
            },
            {
                key: 'downloadLimit',
                type: 'number',
                labelKey: 'settings.download.downloadLimit.label',
                descKey: 'settings.download.downloadLimit.desc',
                icon: 'fas fa-arrow-down-wide-short',
                min: 0,
            },
            {
                key: 'uploadLimit',
                type: 'number',
                labelKey: 'settings.download.uploadLimit.label',
                descKey: 'settings.download.uploadLimit.desc',
                icon: 'fas fa-arrow-up-wide-short',
                min: 0,
            },
            {
                key: 'keepSeeding',
                type: 'switch',
                labelKey: 'settings.download.keepSeeding.label',
                descKey: 'settings.download.keepSeeding.desc',
                icon: 'fas fa-seedling',
            },
        ],
    },
    {
        key: 'connection',
        labelKey: 'settings.tabs.connection',
        titleKey: 'settings.sections.connection',
        icon: 'fas fa-plug',
        items: [
            {
                key: 'serverUrl',
                type: 'text',
                labelKey: 'settings.connection.serverUrl.label',
                descKey: 'settings.connection.serverUrl.desc',
                icon: 'fas fa-server',
                placeholderKey: 'settings.connection.serverUrl.placeholder',
            },
            {
                key: 'timeout',
                type: 'number',
                labelKey: 'settings.connection.timeout.label',
                descKey: 'settings.connection.timeout.desc',
                icon: 'fas fa-stopwatch',
                min: 1,
                max: 120,
            },
            {
                key: 'autoReconnect',
                type: 'switch',
                labelKey: 'settings.connection.autoReconnect.label',
                descKey: 'settings.connection.autoReconnect.desc',
                icon: 'fas fa-rotate-right',
            },
        ],
    },
    {
        key: 'appearance',
        labelKey: 'settings.tabs.appearance',
        titleKey: 'settings.sections.appearance',
        icon: 'fas fa-palette',
        items: [
            {
                key: 'theme',
                type: 'select',
                labelKey: 'settings.appearance.theme.label',
                descKey: 'settings.appearance.theme.desc',
                icon: 'fas fa-swatchbook',
                options: [
                    { value: 'light', labelKey: 'settings.appearance.theme.light' },
                    { value: 'dark', labelKey: 'settings.appearance.theme.dark' },
                    { value: 'system', labelKey: 'settings.appearance.theme.system' },
                ],
            },
            {
                key: 'language',
                type: 'select',
                labelKey: 'settings.appearance.language.label',
                descKey: 'settings.appearance.language.desc',
                icon: 'fas fa-language',
                options: [
                    { value: 'zh-CN', labelKey: 'settings.appearance.language.zhCN' },
                    { value: 'en-US', labelKey: 'settings.appearance.language.enUS' },
                ],
            },
            {
                key: 'compactMode',
                type: 'switch',
                labelKey: 'settings.appearance.compactMode.label',
                descKey: 'settings.appearance.compactMode.desc',
                icon: 'fas fa-compress',
            },
        ],
    },
]

const aboutInfoRows: AboutInfoRow[] = [
    {
        labelKey: 'settings.about.version',
        valueKey: 'settings.about.versionValue',
        icon: 'fas fa-tag',
    },
    {
        labelKey: 'settings.about.build',
        valueKey: 'settings.about.buildValue',
        icon: 'fas fa-box',
    },
    {
        labelKey: 'settings.about.status',
        valueKey: 'settings.about.statusValue',
        icon: 'fas fa-circle-check',
        type: 'success',
    },
]

const configurableTabs = computed(() => tabs)

watch(
    () => props.visible,
    value => {
        if (value) {
            loadSettings()
        }
    },
)

const close = () => {
    emit('update:visible', false)
}

const isVerticalItem = (item: SettingItem) => item.type === 'path'

const setSettingValue = (key: SettingKey, value: SettingValue) => {
    settings[key] = value
}

const loadSettings = () => {
    const localValue = localStorage.getItem('app-settings')
    if (!localValue) return

    try {
        const parsed = JSON.parse(localValue)
        Object.assign(settings, defaultSettings, parsed)
    } catch (error) {
        console.error('Failed to load settings:', error)
    }
}

const saveSettings = () => {
    localStorage.setItem('app-settings', JSON.stringify(settings))
    close()
}

const resetSettings = () => {
    Object.assign(settings, defaultSettings)
}

const selectPath = (key: SettingKey) => {
    console.log('select path for', key)
}
</script>

<style scoped>
.settings-mask {
    position: fixed;
    inset: 0;
    z-index: 2000;
    background: rgba(15, 23, 42, 0.36);
    backdrop-filter: blur(2px);
}

.settings-drawer {
    position: fixed;
    top: 0;
    right: 0;
    z-index: 2001;
    width: 560px;
    max-width: 100vw;
    height: 100vh;
    height: 100dvh;
    display: flex;
    flex-direction: column;
    background: #ffffff;
    box-shadow: -16px 0 40px rgba(15, 23, 42, 0.16);
}

.settings-header {
    flex-shrink: 0;
    min-height: 84px;
    padding: 20px 24px 16px;
    box-sizing: border-box;
    border-bottom: 1px solid #ebeef5;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
}

.settings-title {
    margin: 0;
    font-size: 22px;
    font-weight: 700;
    color: #1f2937;
    display: flex;
    align-items: center;
    gap: 10px;
}

.settings-title-icon,
.section-title-icon,
.settings-tab-icon,
.setting-label-icon,
.info-row-icon,
.button-icon {
    width: 1em;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.settings-subtitle {
    margin: 6px 0 0;
    font-size: 13px;
    color: #909399;
}

.settings-close {
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 10px;
    background: #f5f7fa;
    color: #606266;
    font-size: 20px;
    line-height: 1;
    cursor: pointer;
}

.settings-close:hover {
    background: #ebeef5;
    color: #303133;
}

.settings-tabs {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px 0;
    border-bottom: 1px solid #ebeef5;
    overflow-x: auto;
    scrollbar-width: none;
}

.settings-tabs::-webkit-scrollbar {
    display: none;
}

.settings-tab {
    position: relative;
    flex-shrink: 0;
    height: 44px;
    padding: 0 14px;
    border: none;
    background: transparent;
    color: #606266;
    font-size: 14px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.settings-tab::after {
    content: '';
    position: absolute;
    left: 12px;
    right: 12px;
    bottom: -1px;
    height: 3px;
    border-radius: 999px;
    background: transparent;
}

.settings-tab.active {
    color: #409eff;
    font-weight: 600;
}

.settings-tab.active::after {
    background: #409eff;
}

.settings-tab-icon {
    font-size: 15px;
}

.settings-body {
    flex: 1;
    overflow-y: auto;
    padding: 22px 24px calc(96px + env(safe-area-inset-bottom));
    box-sizing: border-box;
    background: #f8fafc;
    -webkit-overflow-scrolling: touch;
}

.settings-section {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.section-title {
    margin: 0 0 4px;
    font-size: 17px;
    font-weight: 700;
    color: #303133;
    display: flex;
    align-items: center;
    gap: 8px;
}

.section-title-icon {
    color: #409eff;
}

.setting-item {
    min-height: 72px;
    padding: 16px;
    box-sizing: border-box;
    background: #ffffff;
    border: 1px solid #ebeef5;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
}

.setting-item.vertical {
    align-items: stretch;
    flex-direction: column;
}

.setting-info {
    min-width: 0;
}

.setting-label {
    font-size: 15px;
    font-weight: 600;
    color: #303133;
    display: flex;
    align-items: center;
    gap: 8px;
}

.setting-label-icon {
    color: #409eff;
}

.setting-desc {
    margin-top: 5px;
    font-size: 13px;
    line-height: 1.5;
    color: #909399;
}

.path-row {
    display: flex;
    gap: 10px;
}

.setting-input,
.setting-select,
.number-input {
    height: 38px;
    border: 1px solid #dcdfe6;
    border-radius: 9px;
    padding: 0 12px;
    box-sizing: border-box;
    background: #ffffff;
    color: #303133;
    font-size: 14px;
    outline: none;
}

.setting-input:focus,
.setting-select:focus,
.number-input:focus {
    border-color: #409eff;
}

.setting-input {
    width: 100%;
}

.number-input {
    width: 120px;
}

.setting-select {
    width: 150px;
}

.switch {
    position: relative;
    width: 46px;
    height: 26px;
    flex-shrink: 0;
}

.switch input {
    display: none;
}

.switch span {
    position: absolute;
    inset: 0;
    border-radius: 999px;
    background: #dcdfe6;
    cursor: pointer;
    transition: all 0.2s;
}

.switch span::before {
    content: '';
    position: absolute;
    width: 22px;
    height: 22px;
    left: 2px;
    top: 2px;
    border-radius: 50%;
    background: #ffffff;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
    transition: all 0.2s;
}

.switch input:checked+span {
    background: #409eff;
}

.switch input:checked+span::before {
    transform: translateX(20px);
}

.about-card {
    padding: 18px;
    border-radius: 16px;
    background: linear-gradient(135deg, #409eff, #79bbff);
    color: #ffffff;
    display: flex;
    align-items: center;
    gap: 14px;
}

.about-logo {
    width: 52px;
    height: 52px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    font-weight: 800;
}

.about-title {
    font-size: 18px;
    font-weight: 700;
}

.about-desc {
    margin-top: 5px;
    font-size: 13px;
    opacity: 0.9;
}

.info-list {
    background: #ffffff;
    border: 1px solid #ebeef5;
    border-radius: 14px;
    overflow: hidden;
}

.info-row {
    min-height: 52px;
    padding: 0 16px;
    border-bottom: 1px solid #ebeef5;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #606266;
    font-size: 14px;
}

.info-row:last-child {
    border-bottom: none;
}

.info-row strong {
    color: #303133;
}

.info-row .success {
    color: #67c23a;
}

.reset-in-page {
    margin-top: 4px;
    align-self: flex-start;
}

.settings-footer {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    min-height: 72px;
    padding: 14px 24px calc(14px + env(safe-area-inset-bottom));
    box-sizing: border-box;
    border-top: 1px solid #ebeef5;
    background: rgba(255, 255, 255, 0.94);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

.primary-button,
.secondary-button,
.danger-button {
    height: 40px;
    padding: 0 20px;
    border-radius: 9px;
    font-size: 14px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.primary-button {
    border: none;
    color: #ffffff;
    background: #409eff;
}

.primary-button:hover {
    background: #66b1ff;
}

.secondary-button {
    border: 1px solid #dcdfe6;
    color: #606266;
    background: #ffffff;
}

.secondary-button:hover {
    color: #409eff;
    border-color: #409eff;
}

.danger-button {
    border: none;
    color: #ffffff;
    background: #f56c6c;
}

.danger-button:hover {
    background: #ff8787;
}

.settings-mask-fade-enter-active,
.settings-mask-fade-leave-active {
    transition: opacity 0.2s ease;
}

.settings-mask-fade-enter-from,
.settings-mask-fade-leave-to {
    opacity: 0;
}

.settings-slide-enter-active,
.settings-slide-leave-active {
    transition: transform 0.25s ease;
}

.settings-slide-enter-from,
.settings-slide-leave-to {
    transform: translateX(100%);
}

@media (max-width: 768px) {
    .settings-drawer {
        width: 88vw;
    }

    .settings-header {
        padding: 18px 18px 14px;
    }

    .settings-body {
        padding: 18px 18px 96px;
    }

    .settings-footer {
        padding: 14px 18px;
    }
}

@media (max-width: 520px) {
    .settings-drawer {
        width: 100vw;
        height: 100vh;
        height: 100dvh;
    }

    .settings-header {
        min-height: auto;
        padding: 16px;
    }

    .settings-title {
        font-size: 20px;
    }

    .settings-subtitle {
        font-size: 12px;
    }

    .settings-tabs {
        padding: 8px 10px 0;
        gap: 4px;
    }

    .settings-tab {
        height: 42px;
        padding: 0 10px;
        font-size: 13px;
    }

    .settings-body {
        padding: 16px 12px calc(108px + env(safe-area-inset-bottom));
        -webkit-overflow-scrolling: touch;
    }

    .setting-item {
        padding: 14px;
        border-radius: 12px;
        align-items: stretch;
        flex-direction: column;
    }

    .setting-item:not(.vertical) {
        gap: 12px;
    }

    .setting-item .switch,
    .setting-item .setting-select,
    .setting-item .number-input {
        align-self: flex-start;
    }

    .path-row {
        flex-direction: column;
    }

    .number-input,
    .setting-select {
        width: 100%;
    }

    .settings-footer {
        height: auto;
        min-height: calc(72px + env(safe-area-inset-bottom));
        padding: 12px 12px calc(12px + env(safe-area-inset-bottom));
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .settings-footer .primary-button {
        width: 100%;
        height: 46px;
        justify-content: center;
        font-size: 15px;
    }
}
</style>