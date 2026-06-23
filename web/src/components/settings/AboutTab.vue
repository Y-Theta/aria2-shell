<template>
    <div class="about-tab">
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
            <div class="info-row">
                <span>
                    <i class="info-row-icon fas fa-tag" aria-hidden="true"></i>
                    {{ t('settings.about.version') }}
                </span>
                <strong>{{ t('settings.about.versionValue') }}</strong>
            </div>
            <div class="info-row">
                <span>
                    <i class="info-row-icon fas fa-box" aria-hidden="true"></i>
                    {{ t('settings.about.build') }}
                </span>
                <strong>{{ t('settings.about.buildValue') }}</strong>
            </div>
            <div class="info-row">
                <span>
                    <i class="info-row-icon fas fa-circle-check" aria-hidden="true"></i>
                    {{ t('settings.about.status') }}
                </span>
                <strong class="success">{{ t('settings.about.statusValue') }}</strong>
            </div>
        </div>

        <button class="danger-button" type="button" @click="resetSettings">
            <i class="fas fa-rotate-left button-icon" aria-hidden="true"></i>
            {{ t('settings.actions.resetDefault') }}
        </button>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useSettings } from '../../services/settings'
import ConfirmDialog from '../ConfirmDialog.vue'
import { ref } from 'vue'

const { t } = useI18n()
const settingsService = useSettings()
const showResetDialog = ref(false)

function resetSettings() {
    showResetDialog.value = true
}

function confirmReset() {
    settingsService.resetSettings()
    showResetDialog.value = false
}
</script>

<style scoped>
.about-tab {
    display: flex;
    flex-direction: column;
    gap: 14px;
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

.info-row-icon {
    width: 1em;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-right: 6px;
}

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
    border: none;
    color: var(--text-inverse);
    background: var(--danger);
}

.danger-button:hover {
    background: #f87171;
}

.button-icon {
    width: 1em;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}
</style>