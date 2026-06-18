<template>
    <teleport to="body">
        <Transition name="fade">
            <div v-if="visible" class="confirm-dialog-overlay" @click.self="close">
                <div class="confirm-dialog">
                    <div class="confirm-dialog-header">
                        <h3 class="confirm-dialog-title">{{ title }}</h3>
                    </div>
                    <div class="confirm-dialog-body">
                        <p class="confirm-dialog-message">{{ message }}</p>
                    </div>
                    <div class="confirm-dialog-footer">
                        <button class="confirm-dialog-btn cancel-btn" @click="close">
                            {{ t('common.cancel') }}
                        </button>
                        <button class="confirm-dialog-btn confirm-btn" @click="confirm">
                            {{ t('common.confirm') }}
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </teleport>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
    visible: boolean
    title: string
    message: string
}>()

const emit = defineEmits<{
    'update:visible': [value: boolean]
    confirm: []
}>()

const close = () => {
    emit('update:visible', false)
}

const confirm = () => {
    emit('confirm')
    close()
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.confirm-dialog-overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: var(--spacing-lg);
}

.confirm-dialog {
    background-color: var(--panel-bg);
    border-radius: 16px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    max-width: 400px;
    width: 100%;
    overflow: hidden;
}

.confirm-dialog-header {
    padding: var(--spacing-xl) var(--spacing-2xl) var(--spacing-md);
    border-bottom: 1px solid var(--border-gray);
}

.confirm-dialog-title {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary);
}

.confirm-dialog-body {
    padding: var(--spacing-xl) var(--spacing-2xl);
}

.confirm-dialog-message {
    margin: 0;
    font-size: 15px;
    color: var(--text-secondary);
    line-height: 1.6;
}

.confirm-dialog-footer {
    padding: var(--spacing-lg) var(--spacing-2xl) var(--spacing-xl);
    display: flex;
    gap: var(--spacing-md);
    justify-content: flex-end;
}

.confirm-dialog-btn {
    padding: var(--spacing-md) var(--spacing-xl);
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.cancel-btn {
    background-color: var(--bg-gray);
    color: var(--text-primary);
}

.cancel-btn:hover {
    background-color: var(--border-gray);
}

.confirm-btn {
    background-color: var(--error-red);
    color: white;
}

.confirm-btn:hover {
    background-color: #c62828;
}

@media (max-width: 768px) {
    .confirm-dialog-overlay {
        padding: var(--spacing-lg);
    }
    
    .confirm-dialog-header,
    .confirm-dialog-body,
    .confirm-dialog-footer {
        padding-left: var(--spacing-xl);
        padding-right: var(--spacing-xl);
    }
}
</style>