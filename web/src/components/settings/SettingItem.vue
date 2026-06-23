<template>
    <div class="setting-item" :class="{ vertical }">
        <div class="setting-info">
            <div class="setting-label">
                <i v-if="icon" class="setting-label-icon" :class="icon" aria-hidden="true"></i>
                <span>{{ label }}</span>
            </div>
            <div v-if="description" class="setting-desc">
                {{ description }}
            </div>
        </div>
        <slot></slot>
    </div>
</template>

<script setup lang="ts">
interface Props {
    label: string
    description?: string
    icon?: string
    vertical?: boolean
}

defineProps<Props>()
</script>

<style scoped>
.setting-item {
    min-height: 72px;
    padding: 16px;
    box-sizing: border-box;
    background: var(--panel-bg);
    border: 1px solid var(--border-gray);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
}

.setting-item.vertical {
    align-items: stretch;
    flex-direction: column;
}

.setting-info {
    min-width: 0;
}

.setting-label {
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 8px;
}

.setting-label-icon {
    color: var(--primary);
}

.setting-desc {
    margin-top: 5px;
    font-size: 13px;
    line-height: 1.5;
    color: var(--text-muted);
}

@media (max-width: 768px) {
    .setting-item {
        padding: 14px;
        border-radius: 12px;
        align-items: stretch;
        flex-direction: column;
        gap: 12px;
    }

    .setting-item:has(.custom-select-wrapper) {
        flex-direction: row;
        align-items: center;
    }

    .setting-item:has(.number-input) {
        flex-direction: row;
        align-items: center;
    }

    .setting-item:has(.switch) {
        flex-direction: row;
        align-items: center;
    }
}
</style>