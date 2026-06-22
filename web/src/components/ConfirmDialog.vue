<template>
    <teleport to="body">
        <Transition name="fade">
            <div v-if="visible" class="confirm-dialog-overlay" @click.self="close">
                <div class="confirm-dialog">
                    <div class="confirm-dialog-header">
                        <div class="confirm-dialog-icon">
                            <i class="fas fa-circle-exclamation"></i>
                        </div>
                        <h3 class="confirm-dialog-title">{{ title }}</h3>
                    </div>
                    <div class="confirm-dialog-body">
                        <p class="confirm-dialog-message">{{ message }}</p>
                    </div>
                    <div class="confirm-dialog-footer">
                        <button class="confirm-dialog-btn cancel-btn" @click="close">
                            <i class="fas fa-xmark"></i>
                            {{ t('common.cancel') }}
                        </button>
                        <button class="confirm-dialog-btn confirm-btn" @click="confirm">
                            <i class="fas fa-check"></i>
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
    background: rgba(15, 23, 42, 0.36);
    backdrop-filter: blur(2px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    padding: var(--spacing-lg);
}

:global(html[data-theme='dark']) .confirm-dialog-overlay,
:global(html.dark) .confirm-dialog-overlay {
    background: rgba(0, 0, 0, 0.56);
}

.confirm-dialog {
    background-color: var(--panel-bg);
    border-radius: 16px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    max-width: 360px;
    width: 100%;
    overflow: hidden;
}

.confirm-dialog-header {
    padding: var(--spacing-lg) var(--spacing-lg) var(--spacing-sm);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-sm);
}

.confirm-dialog-icon {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: rgba(245, 108, 108, 0.12);
    color: var(--danger);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
}

.confirm-dialog-title {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary);
    text-align: center;
}

.confirm-dialog-body {
    padding: var(--spacing-sm) var(--spacing-lg);
}

.confirm-dialog-message {
    margin: 0;
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.5;
    text-align: center;
}

.confirm-dialog-footer {
    padding: var(--spacing-md) var(--spacing-lg) var(--spacing-lg);
    display: flex;
    gap: var(--spacing-md);
    justify-content: center;
}

.confirm-dialog-btn {
    padding: var(--spacing-sm) var(--spacing-lg);
    border: none;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    flex: 1;
    height: 42px;
}

.confirm-dialog-btn i {
    font-size: 16px;
}

.cancel-btn {
    background-color: var(--bg-gray);
    color: var(--text-primary);
    border: 1px solid var(--border-gray);
}

.cancel-btn:hover {
    background-color: var(--border-gray);
}

.confirm-btn {
    background: var(--danger);
    color: var(--text-inverse);
    box-shadow: 0 6px 14px rgba(245, 108, 108, 0.24);
}

.confirm-btn:hover {
    background: #dd6161;
}

:global(html[data-theme='dark']) .confirm-btn:hover,
:global(html.dark) .confirm-btn:hover {
    background: #f87171;
}

@media (max-width: 768px) {
    .confirm-dialog-overlay {
        padding: var(--spacing-md);
    }

    .confirm-dialog {
        max-width: 100%;
        border-radius: 18px;
    }

    .confirm-dialog-header {
        padding: var(--spacing-md) var(--spacing-md) var(--spacing-xs);
    }

    .confirm-dialog-icon {
        width: 52px;
        height: 52px;
        font-size: 26px;
    }

    .confirm-dialog-title {
        font-size: 17px;
    }

    .confirm-dialog-body {
        padding: var(--spacing-xs) var(--spacing-md);
    }

    .confirm-dialog-message {
        font-size: 14px;
    }

    .confirm-dialog-footer {
        padding: var(--spacing-sm) var(--spacing-md) var(--spacing-md);
        flex-direction: column-reverse;
        gap: var(--spacing-sm);
    }

    .confirm-dialog-btn {
        width: 100%;
        height: 46px;
        font-size: 15px;
    }
}
</style>