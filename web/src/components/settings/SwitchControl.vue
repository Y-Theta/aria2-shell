<template>
    <label class="switch">
        <input type="checkbox" :checked="modelValue" @change="handleChange" />
        <span></span>
    </label>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
    modelValue: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
}>()

function handleChange(event: Event) {
    const target = event.target as HTMLInputElement
    emit('update:modelValue', target.checked)
}
</script>

<style scoped>
.switch {
    position: relative;
    width: 46px;
    height: 26px;
    flex-shrink: 0;
}

.switch input {
    display: none;
}

.switch span {
    position: absolute;
    inset: 0;
    border-radius: 999px;
    background: var(--input-border);
    cursor: pointer;
    transition: all 0.2s;
}

.switch span::before {
    content: '';
    position: absolute;
    width: 22px;
    height: 22px;
    left: 2px;
    top: 2px;
    border-radius: 50%;
    background: var(--panel-bg);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
    transition: all 0.2s;
}

:global(html[data-theme='dark']) .switch span::before,
:global(html.dark) .switch span::before {
    background: #ffffff;
}

.switch input:checked + span {
    background: var(--primary);
}

.switch input:checked + span::before {
    transform: translateX(20px);
}
</style>