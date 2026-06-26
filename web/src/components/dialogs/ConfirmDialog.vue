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
                        <div v-if="showDeleteFileOption" class="delete-file-option">
                            <label class="checkbox-label">
                                <input 
                                    type="checkbox" 
                                    v-model="deleteLocalFile"
                                    class="delete-file-checkbox"
                                />
                                <span>{{ deleteFileLabel }}</span>
                            </label>
                        </div>
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
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
    visible: boolean
    title: string
    message: string
    showDeleteFileOption?: boolean
    deleteFileLabel?: string
}>()

const emit = defineEmits<{
    'update:visible': [value: boolean]
    confirm: [deleteLocalFile: boolean]
}>()

const deleteLocalFile = ref(false)

watch(() => props.visible, (newVal) => {
    if (newVal) {
        deleteLocalFile.value = false
    }
})

const close = () => {
    emit('update:visible', false)
}

const confirm = () => {
    emit('confirm', deleteLocalFile.value)
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
    background: var(--overlay-light);
    backdrop-filter: blur(2px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    padding: var(--spacing-lg);
}

:global(html[data-theme='dark']) .confirm-dialog-overlay,
:global(html.dark) .confirm-dialog-overlay {
    background: var(--overlay-dark);
}

.confirm-dialog {
    background-color: var(--panel-bg);
    border-radius: 16px;
    box-shadow: 0 20px 40px var(--shadow-black);
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
    background: var(--danger-12);
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

.delete-file-option {
    margin-top: var(--spacing-lg);
    padding-top: var(--spacing-md);
    border-top: 1px solid var(--border-gray);
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    cursor: pointer;
    font-size: 14px;
    color: var(--text-secondary);
    user-select: none;
}

.delete-file-checkbox {
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    width: 20px;
    height: 20px;
    min-width: 20px;
    min-height: 20px;
    max-width: 20px;
    max-height: 20px;
    border: 1.5px solid var(--border-gray);
    border-radius: 50%;
    cursor: pointer;
    position: relative;
    flex-shrink: 0;
    flex-grow: 0;
    flex-basis: auto;
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    background-color: transparent;
    outline: none;
}

.delete-file-checkbox:hover {
    border-color: var(--primary-blue);
    box-shadow: 0 0 0 3px var(--primary-blue-10);
}

.delete-file-checkbox:checked {
    border-color: var(--primary-blue);
    background-color: transparent;
}

.delete-file-checkbox:checked::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: var(--primary-blue);
    animation: checkPopIn 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.delete-file-checkbox:active {
    transform: scale(0.92);
}

@keyframes checkPopIn {
    0% {
        transform: translate(-50%, -50%) scale(0);
        opacity: 0;
    }
    70% {
        transform: translate(-50%, -50%) scale(1.1);
    }
    100% {
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
    }
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
    box-shadow: 0 6px 14px var(--shadow-danger);
}

.confirm-btn:hover {
    background: var(--danger-dark-hover);
}

:global(html[data-theme='dark']) .confirm-btn:hover,
:global(html.dark) .confirm-btn:hover {
    background: var(--danger-hover);
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