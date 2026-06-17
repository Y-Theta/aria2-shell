<template>
    <div class="task-toolbar">
        <div class="toolbar-left">
            <button class="btn-primary" @click="$emit('addTask')">
                <i class="fas fa-plus-circle"></i>
                <span>{{ t('taskPage.addTask') }}</span>
            </button>
            <button class="btn-secondary" @click="$emit('startAll')">
                <i class="fas fa-play"></i>
                <span>{{ t('taskPage.start') }}</span>
            </button>
            <button class="btn-secondary" @click="$emit('pauseAll')">
                <i class="fas fa-pause"></i>
                <span>{{ t('taskPage.pause') }}</span>
            </button>
            <button class="btn-danger" @click="$emit('deleteAll')">
                <i class="fas fa-trash"></i>
                <span>{{ t('taskPage.delete') }}</span>
            </button>
        </div>
        <div class="toolbar-right">
            <div class="search-box">
                <i class="fas fa-search"></i>
                <input
                    type="text"
                    :placeholder="t('taskPage.search')"
                    :value="searchText"
                    @input="$emit('update:searchText', ($event.target as HTMLInputElement).value)"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps<{
    searchText: string
}>()

defineEmits<{
    (e: 'addTask'): void
    (e: 'startAll'): void
    (e: 'pauseAll'): void
    (e: 'deleteAll'): void
    (e: 'update:searchText', value: string): void
}>()
</script>

<style scoped>
.task-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-md);
    padding: var(--spacing-lg);
    background-color: var(--panel-bg);
    border-bottom: 1px solid var(--border-gray);
}

.toolbar-left {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    flex-wrap: wrap;
}

.toolbar-right {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
}

.btn-primary,
.btn-secondary,
.btn-danger {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm) var(--spacing-lg);
    font-size: 14px;
    font-weight: 500;
    border-radius: var(--radius-md);
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-primary {
    background-color: var(--primary-blue);
    color: var(--text-inverse);
}

.btn-primary:hover {
    background-color: var(--primary-blue-hover);
    transform: translateY(-1px);
    box-shadow: 0 2px 6px var(--button-shadow);
}

.btn-secondary {
    background-color: var(--bg-gray);
    color: var(--text-primary);
    border: 1px solid var(--border-gray);
}

.btn-secondary:hover {
    background-color: var(--light-gray);
}

.btn-danger {
    background-color: transparent;
    color: var(--error-red);
    border: 1px solid var(--border-gray);
}

.btn-danger:hover {
    background-color: rgba(218, 54, 51, 0.08);
}

.search-box {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    background-color: var(--input-bg);
    border: 1px solid var(--input-border);
    border-radius: var(--radius-md);
    padding: var(--spacing-sm) var(--spacing-md);
    min-width: 240px;
}

.search-box i {
    color: var(--text-muted);
}

.search-box input {
    border: none;
    outline: none;
    background: transparent;
    flex: 1;
    min-width: 0;
    padding: 0;
}

.search-box input::placeholder {
    color: var(--input-placeholder);
}

@media (max-width: 768px) {
    .task-toolbar {
        flex-direction: column;
        align-items: stretch;
        padding: var(--spacing-md);
    }

    .toolbar-left {
        justify-content: flex-start;
    }

    .toolbar-right {
        width: 100%;
    }

    .search-box {
        width: 100%;
        min-width: auto;
    }

    .btn-primary span,
    .btn-secondary span,
    .btn-danger span {
        display: none;
    }
}
</style>