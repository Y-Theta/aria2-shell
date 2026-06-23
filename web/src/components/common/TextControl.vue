<template>
    <input
        :type="type"
        class="text-input"
        :value="modelValue"
        :placeholder="placeholder"
        @input="handleInput"
    />
</template>

<script setup lang="ts">
interface Props {
    modelValue: string
    placeholder?: string
    type?: 'text' | 'password'
}

const props = withDefaults(defineProps<Props>(), {
    type: 'text',
})

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
}>()

function handleInput(event: Event) {
    const target = event.target as HTMLInputElement
    emit('update:modelValue', target.value)
}
</script>

<style scoped>
.text-input {
    height: 38px;
    border: 1px solid var(--input-border);
    border-radius: 9px;
    padding: 0 12px;
    box-sizing: border-box;
    background: var(--input-bg);
    color: var(--input-color);
    font-size: 14px;
    outline: none;
    width: 100%;
}

.text-input::placeholder {
    color: var(--input-placeholder);
}

.text-input:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--input-focus-shadow);
}
</style>