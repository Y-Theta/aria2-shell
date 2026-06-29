import { ref, watch, computed } from 'vue'
import { getSettingsSync } from './settings'

const currentDownloadSpeed = ref(0)

function formatSpeed(bytesPerSecond: number): string {
    if (bytesPerSecond === 0) return '0 B/s'
    const k = 1024
    const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s']
    const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k))
    return parseFloat((bytesPerSecond / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function getAppName(): string {
    const settings = getSettingsSync()
    return (settings.appName as string) || 'aria2-shell'
}

function updateDocumentTitle() {
    const appName = getAppName()
    if (currentDownloadSpeed.value > 0) {
        const speedStr = formatSpeed(currentDownloadSpeed.value)
        document.title = `${appName} (${speedStr})`
    } else {
        document.title = appName
    }
}

export function setDownloadSpeed(speed: number) {
    currentDownloadSpeed.value = speed
    updateDocumentTitle()
}

export function updateTitle() {
    updateDocumentTitle()
}

watch(currentDownloadSpeed, () => {
    updateDocumentTitle()
})