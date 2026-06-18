<template>
    <div class="task-progress-bar">
        <div class="progress-track">
            <div class="progress-fill" :style="{ width: `${progress}%`, backgroundColor: color }"></div>
            <span class="progress-text" :style="{ color: textColor }">{{ displayProgress }}%</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
    progress: number
    status?: 'downloading' | 'completed' | 'paused' | 'error' | 'seeding'
}

const props = withDefaults(defineProps<Props>(), {
    status: 'downloading',
})

const color = computed(() => {
    switch (props.status) {
        case 'completed':
            return 'var(--success-green)'
        case 'paused':
            return 'var(--neutral-gray)'
        case 'error':
            return 'var(--error-red)'
        default:
            return 'var(--primary-blue)'
    }
})

const textColor = computed(() => {
    if (props.progress >= 50) {
        return 'var(--text-inverse)'
    }
    return 'var(--text-primary)'
})

const displayProgress = computed(() => {
    if (Number.isInteger(props.progress)) {
        return props.progress.toString()
    }
    return props.progress.toFixed(2)
})
</script>

<style scoped>
.task-progress-bar {
    width: 100%;
    min-width: 0;
}

.progress-track {
    position: relative;
    height: 20px;
    background-color: var(--light-gray);
    border-radius: 10px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    border-radius: 10px;
    transition: width 0.3s ease;
}

.progress-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 12px;
    font-weight: 600;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
    .task-progress-bar {
        min-width: auto;
    }
}
</style>