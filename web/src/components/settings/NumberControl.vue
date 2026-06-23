<template>
    <input
        type="number"
        class="number-input"
        :value="modelValue"
        :min="min"
        :max="max"
        :placeholder="placeholder"
        @input="handleInput"
    />
</template>

<script setup lang="ts">
interface Props {
    modelValue: number
    min?: number
    max?: number
    placeholder?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: number): void
}>()

function handleInput(event: Event) {
    const target = event.target as HTMLInputElement
    emit('update:modelValue', Number(target.value))
}
</script>

<style scoped>
.number-input {
    height: 38px;
    border: 1px solid var(--input-border);
    border-radius: 9px;
    padding: 0 12px;
    box-sizing: border-box;
    background: var(--input-bg);
    color: var(--input-color);
    font-size: 14px;
    outline: none;
    width: 120px;
}

.number-input::placeholder {
    color: var(--input-placeholder);
}

.number-input:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--input-focus-shadow);
}
</style>