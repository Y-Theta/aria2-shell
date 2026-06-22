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
                            <label class="add-method" :class="{ active: activeMethod === 'regex' }">
                                <input type="radio" v-model="activeMethod" value="regex" />
                                <div class="add-method-icon">
                                    <i class="fas fa-star-of-life"></i>
                                </div>
                                <div class="add-method-content">
                                    <div class="add-method-title">{{ t('addTask.regexAdd') }}</div>
                                    <div class="add-method-desc">{{ t('addTask.regexAddDesc') }}</div>
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
                                    <i class="fas fa-question-circle" title="HTTP(S)/FTP/Magnet links are supported"></i>
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

                            <div v-if="activeMethod === 'regex'" class="form-group">
                                <label class="form-label">{{ t('addTask.regexPattern') }}</label>
                                <div class="input-wrapper">
                                    <i class="fas fa-star-of-life input-icon"></i>
                                    <input
                                        v-model="regexPattern"
                                        type="text"
                                        :placeholder="t('addTask.regexPatternPlaceholder')"
                                    />
                                </div>
                            </div>

                            <div v-if="activeMethod === 'regex'" class="form-group">
                                <label class="form-label">{{ t('addTask.regexUrlTemplate') }}</label>
                                <div class="input-wrapper">
                                    <i class="fas fa-code input-icon"></i>
                                    <input
                                        v-model="regexTemplate"
                                        type="text"
                                        :placeholder="t('addTask.regexUrlTemplatePlaceholder')"
                                    />
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
                                <div class="save-path-wrapper">
                                    <i class="fas fa-folder input-icon"></i>
                                    <span class="save-path">{{ savePath }}</span>
                                    <button class="change-path-btn" type="button">
                                        {{ t('addTask.change') }}
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
                </div>
            </div>
        </Transition>
    </teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

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
const regexPattern = ref('')
const regexTemplate = ref('')
const selectedFile = ref<File | null>(null)
const savePath = ref('/downloads')

const torrentFileInput = ref<HTMLInputElement | null>(null)

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
        case 'regex':
            data.pattern = regexPattern.value
            data.template = regexTemplate.value
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
    regexPattern.value = ''
    regexTemplate.value = ''
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
    max-width: 720px;
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
    grid-template-columns: repeat(4, 1fr);
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-xl);
}

.add-method {
    position: relative;
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
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

.save-path-wrapper {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: 12px 14px;
    border: 1px solid var(--input-border);
    border-radius: 10px;
    background: var(--input-bg);
}

.save-path-wrapper .input-icon {
    position: static;
    transform: none;
}

.save-path {
    flex: 1;
    font-size: 14px;
    color: var(--text-primary);
}

.change-path-btn {
    padding: 8px 14px;
    border: 1px solid var(--border-gray);
    border-radius: 8px;
    background: var(--bg-gray);
    color: var(--text-primary);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
}

.change-path-btn:hover {
    background: var(--light-gray);
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
        align-items: flex-end;
    }

    .add-task-dialog {
        max-width: 100%;
        max-height: 85vh;
        border-radius: 18px 18px 0 0;
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
}

@media (max-width: 480px) {
    .add-methods {
        grid-template-columns: 1fr;
    }
}
</style>