<template>
    <div class="task-toolbar">
        <div class="toolbar-left">
            <button class="btn-primary" @click="$emit('addTask')">
                <i class="fas fa-plus-circle"></i>
                <span>{{ t('taskPage.addTask') }}</span>
            </button>
            <template v-if="isBatchMode">
                <button class="btn-secondary" @click="$emit('startSelected')">
                    <i class="fas fa-play"></i>
                    <span>开始选中</span>
                </button>
                <button class="btn-secondary" @click="$emit('pauseSelected')">
                    <i class="fas fa-pause"></i>
                    <span>暂停选中</span>
                </button>
                <button class="btn-danger" @click="$emit('deleteSelected')">
                    <i class="fas fa-trash"></i>
                    <span>删除选中</span>
                </button>
            </template>
            <template v-else>
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
            </template>
            <button
                class="btn-toggle"
                :class="{ active: isBatchMode }"
                @click="$emit('update:isBatchMode', !isBatchMode)"
            >
                <i class="fas fa-check-square"></i>
                <span>批量操作</span>
            </button>
            <div v-if="isBatchMode" class="selected-count">
                已选 {{ selectedCount }} 项 
            </div>
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
    isBatchMode: boolean
    selectedCount: number
}>()

defineEmits<{
    (e: 'addTask'): void
    (e: 'startAll'): void
    (e: 'pauseAll'): void
    (e: 'deleteAll'): void
    (e: 'update:searchText', value: string): void
    (e: 'update:isBatchMode', value: boolean): void
    (e: 'startSelected'): void
    (e: 'pauseSelected'): void
    (e: 'deleteSelected'): void
}>()
</script>

<style scoped>
.task-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-md);
    padding: var(--spacing-sm) var(--spacing-lg);
    background-color: var(--panel-bg);
    border-bottom: 1px solid var(--border-gray);
    min-height: 56px;
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
.btn-danger,
.btn-toggle {
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

.btn-toggle {
    background-color: var(--bg-gray);
    color: var(--text-primary);
    border: 1px solid var(--border-gray);
}

.btn-toggle:hover {
    background-color: var(--light-gray);
}

.btn-toggle.active {
    background-color: var(--primary-blue);
    color: var(--text-inverse);
    border-color: var(--primary-blue);
}

.btn-toggle.active:hover {
    background-color: var(--primary-blue-hover);
}

.selected-count {
    background-color: var(--primary-blue);
    color: var(--text-inverse);
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm) var(--spacing-lg);
    padding-bottom: calc(var(--spacing-sm) + 1px);
    font-size: 14px;
    font-weight: 500;
    border-radius: var(--radius-md);
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;
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

.search-box input:focus {
    box-shadow: none;
}

.search-box:focus-within {
    border-color: var(--primary-blue);
    box-shadow: none;
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

    .selected-count {
        line-height: 16px;
    }

    .btn-primary span,
    .btn-secondary span,
    .btn-danger span,
    .selected-count span,
    .btn-toggle span {
        display: none;
    }
}
</style>