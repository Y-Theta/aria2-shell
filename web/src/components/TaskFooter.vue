<template>
    <div class="task-footer">
        <div class="footer-stat">
            <i class="fas fa-download"></i>
            <span v-if="!isMobile" class="label">{{ t('taskPage.downloadSpeed') }}:</span>
            <span class="value">{{ formatSpeed(totalDownloadSpeed) }}</span>
        </div>
        <div class="footer-stat">
            <i class="fas fa-upload"></i>
            <span v-if="!isMobile" class="label">{{ t('taskPage.uploadSpeed') }}:</span>
            <span class="value">{{ formatSpeed(totalUploadSpeed) }}</span>
        </div>
        <div v-if="!isMobile" class="footer-stat">
            <i class="fas fa-tachometer-alt"></i>
            <span class="label">{{ t('taskPage.downloadingCount') }}:</span>
            <span class="value">{{ downloadingCount }}</span>
        </div>
        <div v-if="!isMobile" class="footer-stat">
            <i class="fas fa-hdd"></i>
            <span class="label">{{ t('taskPage.availableSpace') }}:</span>
            <span class="value">{{ formatSize(availableSpace) }}</span>
        </div>
        <div v-if="!isMobile" class="footer-stat">
            <i class="fas fa-clock"></i>
            <span class="label">{{ t('taskPage.totalTasks') }}:</span>
            <span class="value">{{ totalTasks }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const isMobile = ref(false)

defineProps<{
    totalDownloadSpeed: number
    totalUploadSpeed: number
    downloadingCount: number
    availableSpace: number
    totalTasks: number
}>()

const checkIsMobile = () => {
    isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
})

onUnmounted(() => {
    window.removeEventListener('resize', checkIsMobile)
})

const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const formatSpeed = (bytesPerSecond: number) => {
    if (bytesPerSecond === 0) return '0 B/s'
    const k = 1024
    const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s']
    const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k))
    return parseFloat((bytesPerSecond / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}
</script>

<style scoped>
.task-footer {
    display: flex;
    align-items: center;
    justify-content: space-around;
    gap: var(--spacing-md);
    padding: var(--spacing-md) var(--spacing-lg);
    background-color: var(--footer-bg);
    border-top: 1px solid var(--footer-border);
    flex-wrap: wrap;
    min-height: 54px;
}

.footer-stat {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
}

.footer-stat i {
    color: var(--text-muted);
    font-size: 16px;
}

.footer-stat .label {
    font-size: 13px;
    color: var(--text-muted);
}

.footer-stat .value {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
}

@media (max-width: 768px) {
    .task-footer {
        justify-content: center;
        padding: var(--spacing-sm) var(--spacing-md);
        gap: var(--spacing-lg);
        border-top: none;
    }

    .footer-stat {
        flex: none;
        min-width: auto;
    }

    .footer-stat .label {
        display: none;
    }
}
</style>