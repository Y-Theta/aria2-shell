<template>
    <textarea
        class="textarea-input"
        :value="modelValue"
        :placeholder="placeholder"
        :rows="rows"
        @input="handleInput"
    />
</template>

<script setup lang="ts">
interface Props {
    modelValue: string
    placeholder?: string
    rows?: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
}>()

function handleInput(event: Event) {
    const target = event.target as HTMLTextAreaElement
    emit('update:modelValue', target.value)
}
</script>

<style scoped>
.textarea-input {
    min-height: 80px;
    padding: 10px 12px;
    box-sizing: border-box;
    border: 1px solid var(--input-border);
    border-radius: 9px;
    background: var(--input-bg);
    color: var(--input-color);
    font-size: 14px;
    font-family: inherit;
    line-height: 1.5;
    resize: vertical;
    outline: none;
    width: 100%;
}

.textarea-input::placeholder {
    color: var(--input-placeholder);
}

.textarea-input:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--input-focus-shadow);
}
</style>