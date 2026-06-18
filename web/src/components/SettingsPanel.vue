<template>
    <!-- Drawer mode: slide-in panel -->
    <template v-if="!inline">
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

                        <div v-for="item in tab.items" :key="item.key" class="setting-item"
                            :class="{ vertical: isVerticalItem(item), button: item.type === 'button' }">
                            <div class="setting-info">
                                <div class="setting-label">
                                    <i v-if="item.icon" class="setting-label-icon" :class="item.icon"
                                        aria-hidden="true"></i>
                                    <span>{{ t(item.labelKey) }}</span>
                                </div>

                                <div v-if="item.descKey" class="setting-desc">
                                    {{ t(item.descKey) }}
                                </div>
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

                            <!-- button -->
                            <button v-else-if="item.type === 'button'" class="setting-action-button"
                                :class="getButtonClass(item)" type="button" @click="handleButtonClick(item)">
                                <i v-if="item.buttonIcon || item.icon" class="button-icon"
                                    :class="item.buttonIcon || item.icon" aria-hidden="true"></i>
                                {{ t(item.buttonTextKey || item.labelKey) }}
                            </button>
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

    <!-- Inline mode: rendered as page content -->
    <div v-else class="settings-inline">
        <header class="settings-header settings-header-inline">
            <div>
                <h2 class="settings-title">
                    <i class="fas fa-gear settings-title-icon" aria-hidden="true"></i>
                    <span>{{ t('settings.title') }}</span>
                </h2>
                <p class="settings-subtitle">{{ t('settings.subtitle') }}</p>
            </div>
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

                <div v-for="item in tab.items" :key="item.key" class="setting-item"
                    :class="{ vertical: isVerticalItem(item), button: item.type === 'button' }">
                    <div class="setting-info">
                        <div class="setting-label">
                            <i v-if="item.icon" class="setting-label-icon" :class="item.icon"
                                aria-hidden="true"></i>
                            <span>{{ t(item.labelKey) }}</span>
                        </div>

                        <div v-if="item.descKey" class="setting-desc">
                            {{ t(item.descKey) }}
                        </div>
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

                    <!-- button -->
                    <button v-else-if="item.type === 'button'" class="setting-action-button"
                        :class="getButtonClass(item)" type="button" @click="handleButtonClick(item)">
                        <i v-if="item.buttonIcon || item.icon" class="button-icon"
                            :class="item.buttonIcon || item.icon" aria-hidden="true"></i>
                        {{ t(item.buttonTextKey || item.labelKey) }}
                    </button>
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
    </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

type SettingValue = string | number | boolean
type SettingType = 'switch' | 'text' | 'number' | 'select' | 'path'
type ButtonType = 'button'
type SettingButtonVariant = 'primary' | 'secondary' | 'danger'
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

interface BaseSettingItem {
    key: string
    labelKey: string
    descKey?: string
    icon?: string
}

interface ValueSettingItem extends BaseSettingItem {
    key: SettingKey
    type: SettingType
    placeholderKey?: string
    min?: number
    max?: number
    options?: SettingOption[]
}

interface ButtonSettingItem extends BaseSettingItem {
    type: ButtonType
    action: string
    buttonTextKey?: string
    buttonIcon?: string
    variant?: SettingButtonVariant
}

type SettingItem = ValueSettingItem | ButtonSettingItem

interface SettingOption {
    labelKey: string
    value: string | number
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
    inline?: boolean
    buttonCallbacks?: Record<string, (item: ButtonSettingItem) => void>
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
            {
                key: 'resetSettings',
                type: 'button',
                labelKey: 'settings.actions.resetDefault',
                descKey: 'settings.general.reset.desc',
                icon: 'fas fa-rotate-left',
                buttonIcon: 'fas fa-rotate-left',
                buttonTextKey: 'settings.actions.resetDefault',
                variant: 'danger',
                action: 'resetSettings',
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

const isButtonItem = (item: SettingItem): item is ButtonSettingItem => {
    return item.type === 'button'
}

const getButtonClass = (item: SettingItem) => {
    if (!isButtonItem(item)) return ''

    return {
        'primary-button': item.variant === 'primary',
        'secondary-button': !item.variant || item.variant === 'secondary',
        'danger-button': item.variant === 'danger',
    }
}

const handleButtonClick = (item: ButtonSettingItem) => {
    if (item.action === 'resetSettings') {
        resetSettings()
        return
    }

    const callback = props.buttonCallbacks?.[item.action]

    if (callback) {
        callback(item)
        return
    }

    console.warn(`No callback found for settings button action: ${item.action}`)
}

const close = () => {
    emit('update:visible', false)
}

const isVerticalItem = (item: SettingItem) => {
    return item.type === 'path'
}

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
    console.log("reset setting");
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

:global(html[data-theme='dark']) .settings-mask,
:global(html.dark) .settings-mask {
    background: rgba(0, 0, 0, 0.56);
}

.settings-drawer {
    position: fixed;
    top: 0;
    right: 0;
    z-index: 2001;
    width: 560px;
    max-width: 100vw;

    height: 100vh;
    height: 100svh;

    display: flex;
    flex-direction: column;

    background: var(--panel-bg);
    color: var(--text-primary);
    box-shadow: -16px 0 40px rgba(15, 23, 42, 0.16);

    overflow: hidden;
    overflow-y: hidden;
}

:global(html[data-theme='dark']) .settings-drawer,
:global(html.dark) .settings-drawer {
    box-shadow: -16px 0 40px rgba(0, 0, 0, 0.46);
}

.settings-header {
    flex-shrink: 0;
    min-height: 84px;
    padding: 20px 24px 16px;
    box-sizing: border-box;
    border-bottom: 1px solid var(--border-gray);
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    background: var(--panel-bg);
}

.settings-title {
    margin: 0;
    font-size: 22px;
    font-weight: 700;
    color: var(--text-primary);
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
    color: var(--text-muted);
}

.settings-close {
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 10px;
    background: var(--danger);
    color: #fff;
    font-size: 20px;
    line-height: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s ease;
}

.settings-close:hover {
    background: #e04848;
}

.settings-tabs {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px 0;
    border-bottom: 1px solid var(--border-gray);
    overflow-x: auto;
    scrollbar-width: none;
    background: var(--panel-bg);
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
    color: var(--text-secondary);
    font-size: 14px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.settings-tab:hover {
    color: var(--primary);
    box-shadow: none;
    transform: none;
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
    color: var(--primary);
    font-weight: 600;
}

.settings-tab.active::after {
    background: var(--primary);
}

.settings-tab-icon {
    font-size: 15px;
}

.settings-body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 22px 24px;
    box-sizing: border-box;
    background: var(--bg-gray);
    color: var(--text-primary);
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
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
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 8px;
}

.section-title-icon {
    color: var(--primary);
}

.setting-item {
    min-height: 72px;
    padding: 16px;
    box-sizing: border-box;
    background: var(--panel-bg);
    border: 1px solid var(--border-gray);
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
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 8px;
}

.setting-label-icon {
    color: var(--primary);
}

.setting-desc {
    margin-top: 5px;
    font-size: 13px;
    line-height: 1.5;
    color: var(--text-muted);
}

.path-row {
    display: flex;
    gap: 10px;
}

.setting-input,
.setting-select,
.number-input {
    height: 38px;
    border: 1px solid var(--input-border);
    border-radius: 9px;
    padding: 0 12px;
    box-sizing: border-box;
    background: var(--input-bg);
    color: var(--input-color);
    font-size: 14px;
    outline: none;
}

.setting-input::placeholder,
.number-input::placeholder {
    color: var(--input-placeholder);
}

.setting-input:focus,
.setting-select:focus,
.number-input:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--input-focus-shadow);
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
    background: var(--input-border);
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
    background: var(--panel-bg);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
    transition: all 0.2s;
}

:global(html[data-theme='dark']) .switch span::before,
:global(html.dark) .switch span::before {
    background: #ffffff;
}

.switch input:checked + span {
    background: var(--primary);
}

.switch input:checked + span::before {
    transform: translateX(20px);
}

.about-card {
    padding: 18px;
    border-radius: 16px;
    background: linear-gradient(135deg, var(--primary), var(--primary-hover));
    color: var(--text-inverse);
    display: flex;
    align-items: center;
    gap: 14px;
}

.about-logo {
    width: 52px;
    height: 52px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.2);
    color: #ffffff;
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
    background: var(--panel-bg);
    border: 1px solid var(--border-gray);
    border-radius: 14px;
    overflow: hidden;
}

.info-row {
    min-height: 52px;
    padding: 0 16px;
    border-bottom: 1px solid var(--border-gray);
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: var(--text-secondary);
    font-size: 14px;
}

.info-row:last-child {
    border-bottom: none;
}

.info-row strong {
    color: var(--text-primary);
}

.info-row .success {
    color: var(--success-green);
}

.reset-in-page {
    margin-top: 4px;
    align-self: flex-start;
}

.settings-footer {
    flex-shrink: 0;
    position: static;
    min-height: 72px;
    padding: 14px 24px calc(14px + env(safe-area-inset-bottom));
    box-sizing: border-box;
    border-top: 1px solid var(--footer-border);
    background: var(--footer-bg);
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
    color: var(--text-inverse);
    background: var(--primary);
}

.primary-button:hover {
    background: var(--primary-hover);
}

.secondary-button {
    border: 1px solid var(--input-border);
    color: var(--text-secondary);
    background: var(--panel-bg);
    display: flex;
    flex-direction: row;
    text-overflow:ellipsis;
    overflow: hidden;
    min-width: 96px;
    letter-spacing: 4px;
    padding: var(--spacing-xs);
}

.secondary-button:hover {
    color: var(--primary);
    border-color: var(--primary);
}

.danger-button {
    border: none;
    color: var(--text-inverse);
    background: var(--danger);
}

.danger-button:hover {
    background: #ff8787;
}

:global(html[data-theme='dark']) .danger-button:hover,
:global(html.dark) .danger-button:hover {
    background: #f87171;
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

/* 按钮类型设置项：电脑端左右排布 */
.setting-item.button {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
}

/* 左侧说明区域 */
.setting-item.button .setting-info {
    flex: 1;
    min-width: 0;
}

/* 右侧按钮 */
.setting-item.button .setting-action-button {
    flex-shrink: 0;
    width: auto;
    min-width: 120px;
}

.setting-action-button {
    min-width: 120px;
    height: 36px;
    padding: 0 16px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition:
        background 0.2s ease,
        color 0.2s ease,
        box-shadow 0.2s ease,
        transform 0.2s ease,
        border-color 0.2s ease;
}

.setting-action-button:hover {
    transform: scale(1.03);
}

.setting-action-button.primary-button {
    background: var(--primary);
    color: var(--text-inverse);
    box-shadow: 0 6px 14px var(--button-shadow);
}

.setting-action-button.primary-button:hover {
    background: var(--primary-blue);
}

.setting-action-button.secondary-button {
    background: var(--bg-gray);
    color: var(--text-primary);
    border: 1px solid var(--input-border);
}

.setting-action-button.secondary-button:hover {
    background: var(--light-blue);
    color: var(--primary);
    border-color: var(--primary);
}

.setting-action-button.danger-button {
    background: var(--danger);
    color: var(--text-inverse);
    box-shadow: 0 6px 14px rgba(245, 108, 108, 0.24);
}

.setting-action-button.danger-button:hover {
    background: #dd6161;
}

:global(html[data-theme='dark']) .setting-action-button.danger-button:hover,
:global(html.dark) .setting-action-button.danger-button:hover {
    background: #f87171;
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
        padding: 14px 18px calc(14px + env(safe-area-inset-bottom));
    }

    .setting-item.button {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
    }

    .setting-item.button .setting-info {
        width: 100%;
    }

    .setting-item.button .setting-action-button {
        width: 100%;
        min-width: 0;
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

/* Inline mode styles */
.settings-inline {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--panel-bg);
}

.settings-header-inline {
    border-bottom: 1px solid var(--border-gray);
}

.settings-inline .settings-body {
    flex: 1;
    overflow-y: auto;
    padding: 20px 24px 24px;
}

.settings-inline .settings-footer {
    position: static;
    border-top: 1px solid var(--border-gray);
    background: var(--footer-bg);
    backdrop-filter: blur(8px);
}

@media (max-width: 768px) {
    .settings-inline .settings-body {
        padding: 16px 16px 24px;
    }

    .settings-inline .settings-footer {
        padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
    }
}
</style>