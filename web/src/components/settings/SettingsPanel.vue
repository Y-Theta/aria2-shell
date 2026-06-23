<template>
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
                        <button
                            v-for="tab in tabs"
                            :key="tab.key"
                            class="settings-tab"
                            :class="{ active: activeTab === tab.key }"
                            type="button"
                            @click="activeTab = tab.key"
                        >
                            <i class="settings-tab-icon" :class="tab.icon" aria-hidden="true"></i>
                            <span>{{ t(tab.labelKey) }}</span>
                        </button>
                    </nav>

                    <main class="settings-body">
                        <DownloadTab v-if="activeTab === 'download'" />
                        <Aria2Tab v-else-if="activeTab === 'aria2'" />
                        <AppearanceTab v-else-if="activeTab === 'appearance'" />
                        <UserTab v-else-if="activeTab === 'user'" @password-changed="handlePasswordChanged" />
                        <AboutTab v-else-if="activeTab === 'about'" />
                    </main>

                    <footer class="settings-footer">
                        <button class="primary-button" type="button" @click="saveSettings" :disabled="isSaving">
                            <i :class="isSaving ? 'fas fa-spinner fa-spin button-icon' : 'fas fa-floppy-disk button-icon'" aria-hidden="true"></i>
                            {{ t('settings.actions.save') }}
                        </button>
                    </footer>
                </aside>
            </transition>
        </teleport>
    </template>

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
            <button
                v-for="tab in tabs"
                :key="tab.key"
                class="settings-tab"
                :class="{ active: activeTab === tab.key }"
                type="button"
                @click="activeTab = tab.key"
            >
                <i class="settings-tab-icon" :class="tab.icon" aria-hidden="true"></i>
                <span>{{ t(tab.labelKey) }}</span>
            </button>
        </nav>

        <main class="settings-body">
            <DownloadTab v-if="activeTab === 'download'" />
            <Aria2Tab v-else-if="activeTab === 'aria2'" />
            <AppearanceTab v-else-if="activeTab === 'appearance'" />
            <UserTab v-else-if="activeTab === 'user'" @password-changed="handlePasswordChanged" />
            <AboutTab v-else-if="activeTab === 'about'" />
        </main>

        <footer class="settings-footer">
            <button class="primary-button" type="button" @click="saveSettings" :disabled="isSaving">
                <i :class="isSaving ? 'fas fa-spinner fa-spin button-icon' : 'fas fa-floppy-disk button-icon'" aria-hidden="true"></i>
                {{ t('settings.actions.save') }}
            </button>
        </footer>
    </div>

    <ConfirmDialog
        v-model:visible="showResetDialog"
        :title="t('settings.confirmReset.title')"
        :message="t('settings.confirmReset.message')"
        @confirm="confirmReset"
    />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettings } from '../../services/settings'
import { useAuth } from '../../services/auth'
import type { SettingsTab } from '../../types/components'
import ConfirmDialog from '../dialogs/ConfirmDialog.vue'
import DownloadTab from './DownloadTab.vue'
import Aria2Tab from './Aria2Tab.vue'
import AppearanceTab from './AppearanceTab.vue'
import UserTab from './UserTab.vue'
import AboutTab from './AboutTab.vue'

const { t } = useI18n()
const settingsService = useSettings()
const authService = useAuth()
const activeTab = ref('download')
const showResetDialog = ref(false)
const isSaving = ref(false)

const tabs: SettingsTab[] = [
    {
        key: 'download',
        labelKey: 'settings.tabs.download',
        icon: 'fas fa-download',
    },
    {
        key: 'aria2',
        labelKey: 'settings.tabs.aria2',
        icon: 'fas fa-server',
    },
    {
        key: 'appearance',
        labelKey: 'settings.tabs.appearance',
        icon: 'fas fa-palette',
    },
    {
        key: 'user',
        labelKey: 'settings.tabs.user',
        icon: 'fas fa-user',
    },
    {
        key: 'about',
        labelKey: 'settings.tabs.about',
        icon: 'fas fa-circle-info',
    },
]

interface Props {
    visible: boolean
    inline?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void
}>()

function close() {
    emit('update:visible', false)
}

async function saveSettings() {
    isSaving.value = true
    const success = await settingsService.saveAllSettings()
    isSaving.value = false
    if (success) {
        close()
    }
}

function confirmReset() {
    settingsService.resetSettings()
    showResetDialog.value = false
}

function handlePasswordChanged() {
    close()
    authService.logout()
}

watch(() => props.visible, async (visible) => {
    if (visible) {
        await settingsService.refreshSettings()
    }
})
</script>

<style scoped>
.settings-mask {
    position: fixed;
    inset: 0;
    z-index: 2000;
    background: var(--overlay-light);
    backdrop-filter: blur(2px);
}

:global(html[data-theme='dark']) .settings-mask,
:global(html.dark) .settings-mask {
    background: var(--overlay-dark);
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
    box-shadow: -16px 0 40px var(--shadow-light);
    overflow: hidden;
    overflow-y: hidden;
}

:global(html[data-theme='dark']) .settings-drawer,
:global(html.dark) .settings-drawer {
    box-shadow: -16px 0 40px var(--shadow-dark);
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
.settings-tab-icon,
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
    color: var(--text-inverse);
    font-size: 20px;
    line-height: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s ease;
}

.settings-close:hover {
    background: var(--danger-hover);
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

.primary-button:hover {
    background: var(--primary-hover);
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
        width: 100vw;
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

    .settings-title {
        font-size: 20px;
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