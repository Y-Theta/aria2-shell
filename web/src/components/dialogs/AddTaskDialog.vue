<template>
    <teleport to="body">
        <Transition name="fade">
            <div v-if="visible" class="add-task-dialog-overlay" @click.self="close">
                <div class="add-task-dialog">
                    <div class="add-task-header">
                        <div class="add-task-icon">
                            <i class="fas fa-download"></i>
                        </div>
                        <div class="add-task-title-group">
                            <h2 class="add-task-title">{{ t('addTask.title') }}</h2>
                            <p class="add-task-subtitle">{{ t('addTask.subtitle') }}</p>
                        </div>
                    </div>

                    <div class="add-task-body">
                        <div class="add-methods">
                            <label class="add-method" :class="{ active: activeMethod === 'single' }">
                                <input type="radio" v-model="activeMethod" value="single" />
                                <div class="add-method-icon">
                                    <i class="fas fa-link"></i>
                                </div>
                                <div class="add-method-content">
                                    <div class="add-method-title">{{ t('addTask.singleUrl') }}</div>
                                    <div class="add-method-desc">{{ t('addTask.singleUrlDesc') }}</div>
                                </div>
                            </label>
                            <label class="add-method" :class="{ active: activeMethod === 'batch' }">
                                <input type="radio" v-model="activeMethod" value="batch" />
                                <div class="add-method-icon">
                                    <i class="fas fa-list"></i>
                                </div>
                                <div class="add-method-content">
                                    <div class="add-method-title">{{ t('addTask.batchUrl') }}</div>
                                    <div class="add-method-desc">{{ t('addTask.batchUrlDesc') }}</div>
                                </div>
                            </label>
                            <label class="add-method" :class="{ active: activeMethod === 'torrent' }">
                                <input type="radio" v-model="activeMethod" value="torrent" />
                                <div class="add-method-icon">
                                    <i class="fas fa-file-archive"></i>
                                </div>
                                <div class="add-method-content">
                                    <div class="add-method-title">{{ t('addTask.uploadTorrent') }}</div>
                                    <div class="add-method-desc">{{ t('addTask.uploadTorrentDesc') }}</div>
                                </div>
                            </label>
                        </div>

                        <div class="form-content">
                            <div v-if="activeMethod === 'single'" class="form-group">
                                <label class="form-label">{{ t('addTask.downloadUrl') }}
                                    <i class="fas fa-question-circle" :title="t('addTask.linkSupported')"></i>
                                </label>
                                <div class="input-wrapper">
                                    <i class="fas fa-link input-icon"></i>
                                    <input
                                        v-model="singleUrl"
                                        type="text"
                                        :placeholder="t('addTask.downloadUrlPlaceholder')"
                                    />
                                </div>
                            </div>

                            <div v-if="activeMethod === 'batch'" class="form-group">
                                <label class="form-label">{{ t('addTask.batchUrl') }}</label>
                                <div class="textarea-wrapper">
                                    <i class="fas fa-list input-icon"></i>
                                    <textarea
                                        v-model="batchUrls"
                                        :placeholder="t('addTask.batchUrlsPlaceholder')"
                                        rows="5"
                                    ></textarea>
                                </div>
                            </div>

                            <div v-if="activeMethod === 'torrent'" class="form-group">
                                <label class="form-label">{{ t('addTask.selectTorrentFile') }}</label>
                                <div class="file-upload" @click="triggerFileInput" @dragover.prevent @drop.prevent="handleDrop">
                                    <div class="file-upload-icon">
                                        <i class="fas fa-cloud-upload-alt"></i>
                                    </div>
                                    <div class="file-upload-text">
                                        {{ t('addTask.selectTorrentFileDesc') }}
                                    </div>
                                    <input
                                        ref="torrentFileInput"
                                        type="file"
                                        accept=".torrent"
                                        @change="handleFileSelect"
                                        style="display: none"
                                    />
                                </div>
                                <div v-if="selectedFile" class="selected-file">
                                    <i class="fas fa-file"></i>
                                    <span class="file-name">{{ selectedFile.name }}</span>
                                    <button class="remove-file-btn" @click="removeFile">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="form-label">{{ t('addTask.saveTo') }}</label>
                                <div class="save-path-selector">
                                    <div class="path-label-select-wrapper">
                                        <CustomSelect
                                            v-model="selectedPathLabel"
                                            :options="savePathOptions"
                                        />
                                    </div>
                                    <div class="divider"></div>
                                    <div class="path-input-wrapper">
                                        <input
                                            v-model="savePath"
                                            type="text"
                                            :placeholder="t('addTask.savePathPlaceholder')"
                                            :disabled="!isCustomPath"
                                        />
                                    </div>
                                    <button class="browse-path-btn" type="button" @click="openFileSelector">
                                        <i class="fas fa-folder-open"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="add-task-footer">
                        <button class="footer-btn cancel-btn" @click="close">
                            {{ t('common.cancel') }}
                        </button>
                        <button class="footer-btn confirm-btn" @click="confirm">
                            <i class="fas fa-download"></i>
                            {{ t('addTask.startNow') }}
                        </button>
                    </div>

                    <FileSelectorDialog
                        v-model:visible="fileSelectorVisible"
                        :initial-path="savePath"
                        @select="handlePathSelect"
                    />
                </div>
            </div>
        </Transition>
    </teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettings } from '../../services/settings.ts'
import CustomSelect from '../common/CustomSelect.vue'
import FileSelectorDialog from './FileSelectorDialog.vue'
import type { SavePath } from '../../types/settings.ts'

const { t } = useI18n()
const settingsService = useSettings()

const props = defineProps<{
    visible: boolean
}>()

const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void
    (e: 'addTask', data: any): void
}>()

const activeMethod = ref('single')
const singleUrl = ref('')
const batchUrls = ref('')
const selectedFile = ref<File | null>(null)
const savePath = ref('')
const selectedPathLabel = ref('')
const fileSelectorVisible = ref(false)

const torrentFileInput = ref<HTMLInputElement | null>(null)

const CUSTOM_PATH_VALUE = 'custom'

const isCustomPath = computed(() => selectedPathLabel.value === CUSTOM_PATH_VALUE)

const savePathOptions = computed(() => {
    const savePaths = (settingsService.settings.savePaths as SavePath[]) || []
    const options = savePaths.map(path => ({
        value: path.label,
        label: path.label
    }))
    // 添加自定义选项
    options.push({
        value: CUSTOM_PATH_VALUE,
        label: t('addTask.customPath')
    })
    return options
})

// 监听设置中保存路径的变化，确保当前选择仍然有效
watch(
    () => settingsService.settings.savePaths,
    (newSavePaths) => {
        const paths = (newSavePaths as SavePath[]) || []
        // 检查当前选择的标签是否还存在
        if (selectedPathLabel.value && selectedPathLabel.value !== CUSTOM_PATH_VALUE) {
            const exists = paths.some(p => p.label === selectedPathLabel.value)
            if (!exists) {
                // 当前选择的标签不存在了，切换到第一个或自定义
                if (paths.length > 0) {
                    selectedPathLabel.value = paths[0].label
                    savePath.value = paths[0].path
                } else {
                    selectedPathLabel.value = CUSTOM_PATH_VALUE
                }
            }
        }
    },
    { deep: true }
)

watch(selectedPathLabel, (label) => {
    if (label === CUSTOM_PATH_VALUE) {
        // 自定义模式，保持当前路径不变
        return
    }
    const savePaths = (settingsService.settings.savePaths as SavePath[]) || []
    const selected = savePaths.find(p => p.label === label)
    if (selected) {
        savePath.value = selected.path
    }
})

const close = () => {
    emit('update:visible', false)
    resetForm()
}

const confirm = () => {
    const data: any = {
        method: activeMethod.value,
        savePath: savePath.value,
    }

    switch (activeMethod.value) {
        case 'single':
            data.url = singleUrl.value
            break
        case 'batch':
            data.urls = batchUrls.value.split('\n').filter(u => u.trim())
            break
        case 'torrent':
            data.file = selectedFile.value
            break
    }

    emit('addTask', data)
    close()
}

const resetForm = () => {
    activeMethod.value = 'single'
    singleUrl.value = ''
    batchUrls.value = ''
    selectedFile.value = null
    if (torrentFileInput.value) {
        torrentFileInput.value.value = ''
    }
}

const triggerFileInput = () => {
    torrentFileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement
    if (target.files && target.files.length > 0) {
        selectedFile.value = target.files[0]
    }
}

const handleDrop = (event: DragEvent) => {
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
        const file = event.dataTransfer.files[0]
        if (file.name.endsWith('.torrent')) {
            selectedFile.value = file
        }
    }
}

const removeFile = () => {
    selectedFile.value = null
    if (torrentFileInput.value) {
        torrentFileInput.value.value = ''
    }
}

const openFileSelector = () => {
    fileSelectorVisible.value = true
}

const handlePathSelect = (path: string) => {
    // 选择路径时，自动切换到自定义模式
    selectedPathLabel.value = CUSTOM_PATH_VALUE
    savePath.value = path
}

// 当弹窗显示时，初始化路径选择
watch(
    () => props.visible,
    (visible) => {
        if (visible) {
            const savePaths = (settingsService.settings.savePaths as SavePath[]) || []
            if (savePaths.length > 0) {
                // 优先选择标记为默认的路径
                const defaultPath = savePaths.find(p => p.isDefault)
                if (defaultPath) {
                    selectedPathLabel.value = defaultPath.label
                    savePath.value = defaultPath.path
                } else {
                    // 如果没有标记为默认的，选择第一个
                    selectedPathLabel.value = savePaths[0].label
                    savePath.value = savePaths[0].path
                }
            }
        }
    },
    { immediate: true }
)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: all 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.add-task-dialog {
    transition: transform 0.2s ease, opacity 0.2s ease;
}

.fade-enter-from .add-task-dialog,
.fade-leave-to .add-task-dialog {
    transform: scale(0.95);
    opacity: 0;
}

.add-task-dialog-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.36);
    backdrop-filter: blur(2px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: var(--spacing-lg);
}

:global(html[data-theme='dark']) .add-task-dialog-overlay,
:global(html.dark) .add-task-dialog-overlay {
    background: rgba(0, 0, 0, 0.56);
}

.add-task-dialog {
    background-color: var(--panel-bg);
    border-radius: 16px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    max-width: 840px;
    width: 100%;
    max-height: 90vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.add-task-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-xl) var(--spacing-xl) var(--spacing-lg);
    border-bottom: 1px solid var(--border-gray);
}

.add-task-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-blue-hover) 100%);
    color: var(--text-inverse);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
}

.add-task-title-group {
    flex: 1;
}

.add-task-title {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1.3;
}

.add-task-subtitle {
    margin: 4px 0 0 0;
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.4;
}

.add-task-body {
    padding: var(--spacing-xl);
    overflow-y: auto;
    flex: 1;
}

.add-methods {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-xl);
}

.add-method {
    position: relative;
    display: flex;
    align-items: center;
    flex-direction: row;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm);
    border-radius: 12px;
    border: 2px solid var(--border-gray);
    background: var(--bg-gray);
    cursor: pointer;
    transition: all 0.2s ease;
}

.add-method:hover {
    border-color: var(--light-gray);
}

.add-method.active {
    border-color: var(--primary-blue);
    background: linear-gradient(135deg, rgba(31, 111, 235, 0.08) 0%, rgba(56, 139, 253, 0.04) 100%);
}

.add-method input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
}

.add-method-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: var(--light-gray);
    color: var(--neutral-gray);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    transition: all 0.2s ease;
    flex-shrink: 0;
}

.add-method.active .add-method-icon {
    background: var(--primary-blue);
    color: var(--text-inverse);
}

.add-method-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
}

.add-method-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);
}

.add-method-desc {
    font-size: 13px;
    color: var(--text-secondary);
}

.form-content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
}

.form-label {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
}

.form-label i {
    color: var(--text-muted);
    font-size: 13px;
}

.input-wrapper,
.textarea-wrapper {
    position: relative;
}

.input-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-muted);
    font-size: 16px;
    pointer-events: none;
}

.textarea-wrapper .input-icon {
    top: 16px;
    transform: none;
}

.input-wrapper input,
.textarea-wrapper textarea {
    width: 100%;
    padding: 12px 14px 12px 44px;
    border: 1px solid var(--input-border);
    border-radius: 10px;
    background: var(--input-bg);
    color: var(--input-color);
    font-size: 14px;
    line-height: 1.5;
    transition: all 0.2s ease;
}

.textarea-wrapper textarea {
    padding-top: 14px;
    padding-bottom: 14px;
    resize: vertical;
}

.input-wrapper input:focus,
.textarea-wrapper textarea:focus {
    outline: none;
    border-color: var(--primary-blue);
    box-shadow: 0 0 0 3px var(--input-focus-shadow);
}

.save-path-selector {
    display: flex;
    align-items: stretch;
    border: 1px solid var(--input-border);
    border-radius: 10px;
    background: var(--input-bg);
    overflow: hidden;
    transition: all 0.2s ease;
}

.save-path-selector:focus-within {
    border-color: var(--primary-blue);
    box-shadow: 0 0 0 3px var(--input-focus-shadow);
}

.path-label-select-wrapper {
    flex-shrink: 0;
    display: flex;
    align-items: center;
}

.path-label-select-wrapper :deep(.custom-select-wrapper) {
    width: 140px;
}

.path-label-select-wrapper :deep(.custom-select-display) {
    border: none;
    border-radius: 0;
    height: 44px;
    padding: 0 40px 0 12px;
    background: transparent;
}

.path-label-select-wrapper :deep(.custom-select-display:hover) {
    border-color: transparent;
}

.divider {
    width: 1px;
    background: var(--border-gray);
    flex-shrink: 0;
}

.path-input-wrapper {
    flex: 1;
    display: flex;
    align-items: center;
}

.path-input-wrapper input {
    flex: 1;
    height: 44px;
    border: none;
    border-radius: 0;
    padding: 0 12px;
    background: transparent;
    font-size: 14px;
    color: var(--input-color);
    outline: none;
}

.path-input-wrapper input:disabled {
    color: var(--text-muted);
    cursor: not-allowed;
}

.path-input-wrapper input::placeholder {
    color: var(--input-placeholder);
}

.browse-path-btn {
    flex-shrink: 0;
    width: 44px;
    height: 44px;
    border: none;
    background: transparent;
    color: var(--text-secondary);
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.browse-path-btn:hover {
    color: var(--primary);
    background: var(--bg-gray);
}

.file-upload {
    border: 2px dashed var(--border-gray);
    border-radius: 12px;
    padding: var(--spacing-xl);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-sm);
    cursor: pointer;
    transition: all 0.2s ease;
    background: var(--bg-gray);
}

.file-upload:hover {
    border-color: var(--primary-blue);
    background: rgba(31, 111, 235, 0.04);
}

.file-upload-icon {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    background: var(--light-gray);
    color: var(--primary-blue);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
}

.file-upload-text {
    font-size: 14px;
    color: var(--text-secondary);
    text-align: center;
}

.selected-file {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
    border-radius: 10px;
    background: var(--bg-gray);
    border: 1px solid var(--border-gray);
}

.selected-file i {
    color: var(--primary-blue);
    font-size: 18px;
}

.file-name {
    flex: 1;
    font-size: 14px;
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.remove-file-btn {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    border: none;
    background: transparent;
    color: var(--text-muted);
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
}

.remove-file-btn:hover {
    background: rgba(218, 54, 51, 0.1);
    color: var(--error-red);
}

.add-task-footer {
    display: flex;
    gap: var(--spacing-md);
    padding: var(--spacing-lg) var(--spacing-xl);
    border-top: 1px solid var(--border-gray);
    justify-content: flex-end;
}

.footer-btn {
    padding: 12px 24px;
    border-radius: 10px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
}

.cancel-btn {
    background: var(--bg-gray);
    color: var(--text-primary);
    border: 1px solid var(--border-gray);
}

.cancel-btn:hover {
    background: var(--light-gray);
}

.confirm-btn {
    background: linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-blue-hover) 100%);
    color: var(--text-inverse);
    border: none;
    box-shadow: 0 6px 16px var(--button-shadow);
}

.confirm-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 20px var(--button-shadow-hover);
}

@media (max-width: 768px) {
    .add-task-dialog-overlay {
        padding: var(--spacing-md);
        align-items: center;
    }

    .add-task-dialog {
        width: calc(100% - 32px);
        max-width: 560px;
        max-height: 85vh;
        border-radius: 16px;
    }

    .add-task-header {
        padding: var(--spacing-lg) var(--spacing-md) var(--spacing-md);
    }

    .add-task-icon {
        width: 42px;
        height: 42px;
        font-size: 20px;
        border-radius: 10px;
    }

    .add-task-title {
        font-size: 18px;
    }

    .add-task-subtitle {
        font-size: 13px;
    }

    .add-task-body {
        padding: var(--spacing-md);
    }

    .add-methods {
        grid-template-columns: repeat(2, 1fr);
        gap: var(--spacing-sm);
    }

    .add-method {
        padding: var(--spacing-sm);
        flex-direction: row;
    }

    .add-method-icon {
        width: 36px;
        height: 36px;
        font-size: 16px;
        border-radius: 8px;
    }

    .add-method-title {
        font-size: 14px;
    }

    .add-method-desc {
        font-size: 12px;
    }

    .add-task-footer {
        padding: var(--spacing-md);
    }

    .footer-btn {
        flex: 1;
        justify-content: center;
        padding: 14px 16px;
    }

    .path-label-select-wrapper :deep(.custom-select-wrapper) {
        width: 100px;
    }
}

@media (max-width: 480px) {
    .add-methods {
        grid-template-columns: 1fr;
    }
}
</style>