<template>
    <div class="download-tab">
        <SettingItem
            :label="t('settings.download.maxActiveDownloads.label')"
            :description="t('settings.download.maxActiveDownloads.desc')"
            icon="fas fa-layer-group"
        >
            <NumberControl
                v-model="maxActiveDownloads"
                :min="1"
                :max="20"
            />
        </SettingItem>

        <SettingItem
            :label="t('settings.download.downloadLimit.label')"
            :description="t('settings.download.downloadLimit.desc')"
            icon="fas fa-arrow-down-wide-short"
        >
            <NumberControl
                v-model="downloadLimit"
                :min="0"
            />
        </SettingItem>

        <SettingItem
            :label="t('settings.download.uploadLimit.label')"
            :description="t('settings.download.uploadLimit.desc')"
            icon="fas fa-arrow-up-wide-short"
        >
            <NumberControl
                v-model="uploadLimit"
                :min="0"
            />
        </SettingItem>

        <div class="section-title">
            <i class="fas fa-folder section-title-icon" aria-hidden="true"></i>
            <span>{{ t('settings.download.defaultSavePaths') }}</span>
        </div>

        <div class="path-list">
            <div v-for="(path, index) in savePaths" :key="index" class="path-item">
                <div class="path-inputs">
                    <input
                        v-model="path.label"
                        class="path-label-input"
                        type="text"
                        :placeholder="t('settings.download.pathLabelPlaceholder')"
                    />
                    <input
                        v-model="path.path"
                        class="path-value-input"
                        type="text"
                        :placeholder="t('settings.download.pathPlaceholder')"
                    />
                </div>
                <div class="path-buttons">
                    <button class="browse-btn" type="button" @click="openFileSelector(index)">
                        <i class="fas fa-folder-open" aria-hidden="true"></i>
                    </button>
                    <button class="remove-path-btn" type="button" @click="removePath(index)">
                        <i class="fas fa-trash" aria-hidden="true"></i>
                    </button>
                </div>
            </div>
        </div>

        <button class="add-path-btn" type="button" @click="addPath">
            <i class="fas fa-plus button-icon" aria-hidden="true"></i>
            {{ t('settings.download.addPath') }}
        </button>

        <FileSelectorDialog
            v-model:visible="fileSelectorVisible"
            :initial-path="savePaths[selectedPathIndex]?.path"
            @select="handlePathSelect"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettings } from '../../services/settings'
import SettingItem from './SettingItem.vue'
import NumberControl from './NumberControl.vue'
import FileSelectorDialog from '../FileSelectorDialog.vue'

const { t } = useI18n()
const settingsService = useSettings()
const settings = settingsService.settings

interface SavePath {
    label: string
    path: string
}

const maxActiveDownloads = ref<number>(settings.maxActiveDownloads as number)
const downloadLimit = ref<number>(settings.downloadLimit as number)
const uploadLimit = ref<number>(settings.uploadLimit as number)
const savePaths = ref<SavePath[]>([
    { label: '默认', path: '' }
])
const fileSelectorVisible = ref(false)
const selectedPathIndex = ref(0)

watch(maxActiveDownloads, (value) => {
    settingsService.setSetting('maxActiveDownloads', value)
})

watch(downloadLimit, (value) => {
    settingsService.setSetting('downloadLimit', value)
})

watch(uploadLimit, (value) => {
    settingsService.setSetting('uploadLimit', value)
})

function addPath() {
    savePaths.value.push({ label: '', path: '' })
}

function removePath(index: number) {
    if (savePaths.value.length > 1) {
        savePaths.value.splice(index, 1)
    }
}

function openFileSelector(index: number) {
    selectedPathIndex.value = index
    fileSelectorVisible.value = true
}

function handlePathSelect(selectedPath: string) {
    if (selectedPathIndex.value >= 0 && selectedPathIndex.value < savePaths.value.length) {
        savePaths.value[selectedPathIndex.value].path = selectedPath
    }
}
</script>

<style scoped>
.download-tab {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.section-title {
    margin: 4px 0 0;
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 8px;
}

.section-title-icon {
    color: var(--primary);
}

.path-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.path-item {
    padding: 12px;
    background: var(--panel-bg);
    border: 1px solid var(--border-gray);
    border-radius: 12px;
    display: flex;
    gap: 10px;
    align-items: center;
}

.path-inputs {
    flex: 1;
    display: flex;
    gap: 10px;
}

.path-label-input,
.path-value-input {
    height: 36px;
    border: 1px solid var(--input-border);
    border-radius: 8px;
    padding: 0 10px;
    box-sizing: border-box;
    background: var(--input-bg);
    color: var(--input-color);
    font-size: 14px;
    outline: none;
}

.path-label-input {
    width: 120px;
}

.path-value-input {
    flex: 1;
}

.path-label-input::placeholder,
.path-value-input::placeholder {
    color: var(--input-placeholder);
}

.path-label-input:focus,
.path-value-input:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--input-focus-shadow);
}

.path-buttons {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
}

.browse-btn {
    width: 36px;
    height: 36px;
    border: 1px solid var(--border-gray);
    border-radius: 8px;
    background: var(--panel-bg);
    color: var(--text-secondary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
}

.browse-btn:hover {
    border-color: var(--primary);
    color: var(--primary);
}

.remove-path-btn {
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 8px;
    background: var(--danger);
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
}

.remove-path-btn:hover {
    background: #f87171;
}

.add-path-btn {
    height: 40px;
    border: 1px dashed var(--border-gray);
    border-radius: 10px;
    background: transparent;
    color: var(--text-secondary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s;
    font-size: 14px;
}

.add-path-btn:hover {
    border-color: var(--primary);
    color: var(--primary);
}

.button-icon {
    width: 1em;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

@media (max-width: 768px) {
    .path-item {
        flex-direction: column;
        align-items: stretch;
    }

    .path-inputs {
        flex-direction: column;
    }

    .path-label-input {
        width: 100%;
    }

    .path-value-input{
        flex-basis: auto;
    }

    .path-buttons {
        width: 100%;
    }

    .browse-btn,
    .remove-path-btn {
        flex: 1;
    }
}
</style>