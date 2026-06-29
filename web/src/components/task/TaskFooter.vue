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
    border-top: 1px solid var(--border-gray);
    flex-wrap: wrap;
    min-height: 40pt;
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
        justify-content: space-between;
        padding: var(--spacing-sm) var(--spacing-md);
        gap: var(--spacing-md);
        border-top: none;
    }

    .footer-stat {
        flex: none;
        min-width: auto;
    }

    .footer-stat .label {
        display: none;
    }

    .connection-indicator {
        margin-right: auto;
    }

    .connection-indicator .status-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        display: block;
    }

    .connection-indicator.connected .status-dot {
        background-color: #22c55e;
        box-shadow: 0 0 8px rgba(34, 197, 94, 0.6);
        animation: footer-pulse 2s infinite;
    }

    .connection-indicator.disconnected .status-dot {
        background-color: #ef4444;
    }
}

@keyframes footer-pulse {
    0%, 100% {
        opacity: 1;
        transform: scale(1);
    }
    50% {
        opacity: 0.7;
        transform: scale(0.9);
    }
}
</style>