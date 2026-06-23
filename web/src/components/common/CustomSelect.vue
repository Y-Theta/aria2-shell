<template>
    <div class="custom-select-wrapper" ref="wrapper" @click="toggleDropdown">
        <div class="custom-select-display" :class="{ active: isOpen }">
            <span class="custom-select-value">{{ selectedLabel }}</span>
            <span class="custom-select-arrow">
                <i class="fas fa-chevron-down" aria-hidden="true"></i>
            </span>
        </div>
        <div v-if="isOpen" class="custom-select-dropdown" :style="dropdownStyle" @click.stop>
            <div
                v-for="option in options"
                :key="option.value"
                class="custom-select-option"
                :class="{ selected: option.value === modelValue }"
                @click="selectOption(option)"
            >
                {{ option.label }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue'
import type { SelectOption } from '../../types/components'

interface Props {
    modelValue: string | number
    options: SelectOption[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: string | number): void
}>()

const isOpen = ref(false)
const wrapper = ref<HTMLElement>()
const dropdownStyle = reactive({
    top: '0px',
    left: '0px',
    width: '0px'
})

const selectedLabel = computed(() => {
    const selected = props.options.find(o => o.value === props.modelValue)
    return selected?.label || ''
})

function toggleDropdown() {
    if (wrapper.value) {
        const rect = wrapper.value.getBoundingClientRect()
        dropdownStyle.top = `${rect.bottom + 6}px`
        dropdownStyle.left = `${rect.left}px`
        dropdownStyle.width = `${rect.width}px`
    }
    isOpen.value = !isOpen.value
}

function selectOption(option: SelectOption) {
    emit('update:modelValue', option.value)
    isOpen.value = false
}

function handleClickOutside(event: MouseEvent) {
    if (wrapper.value && !wrapper.value.contains(event.target as Node)) {
        isOpen.value = false
    }
}

onMounted(() => {
    document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.custom-select-wrapper {
    position: relative;
    display: inline-block;
    width: 150px;
}

.custom-select-display {
    height: 38px;
    border: 1px solid var(--input-border);
    border-radius: 9px;
    padding: 0 40px 0 12px;
    box-sizing: border-box;
    background: var(--input-bg);
    color: var(--input-color);
    font-size: 14px;
    outline: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: all 0.2s ease;
}

.custom-select-display:hover {
    border-color: var(--primary);
}

.custom-select-display.active {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--input-focus-shadow);
}

.custom-select-value {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
}

.custom-select-arrow {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-secondary);
    pointer-events: none;
    transition: transform 0.2s ease;
}

.custom-select-display.active .custom-select-arrow {
    transform: translateY(-50%) rotate(180deg);
    color: var(--primary);
}

.custom-select-dropdown {
    position: fixed;
    background: var(--panel-bg);
    border: 1px solid var(--border-gray);
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(15, 23, 42, 0.15);
    z-index: 10000;
    overflow: hidden;
    animation: dropdownOpen 0.2s ease;
    max-height: 300px;
    overflow-y: auto;
}

@keyframes dropdownOpen {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.custom-select-option {
    padding: 12px 14px;
    font-size: 14px;
    color: var(--text-primary);
    cursor: pointer;
    transition: all 0.15s ease;
}

.custom-select-option:hover {
    background: var(--bg-gray);
}

.custom-select-option.selected {
    background: var(--primary);
    color: var(--text-inverse);
}

.custom-select-option.selected:hover {
    background: var(--primary-hover);
}
</style>