<template>
    <select class="select-control" :value="modelValue" @change="handleChange">
        <option v-for="option in options" :key="option.value" :value="option.value">
            {{ option.label }}
        </option>
    </select>
</template>

<script setup lang="ts">
interface Option {
    label: string
    value: string | number
}

interface Props {
    modelValue: string | number
    options: Option[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: string | number): void
}>()

function handleChange(event: Event) {
    const target = event.target as HTMLSelectElement
    const selectedOption = props.options.find(o => String(o.value) === target.value)
    if (selectedOption) {
        emit('update:modelValue', selectedOption.value)
    }
}
</script>

<style scoped>
.select-control {
    height: 38px;
    border: 1px solid var(--input-border);
    border-radius: 9px;
    padding: 0 12px;
    box-sizing: border-box;
    background: var(--input-bg);
    color: var(--input-color);
    font-size: 14px;
    outline: none;
    width: 150px;
}

.select-control:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--input-focus-shadow);
}
</style>