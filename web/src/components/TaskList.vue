<template>
  <div class="task-list">
    <div class="table-header">
      <div class="col-file">File</div>
      <div class="col-progress">Progress</div>
      <div class="col-speed">Spd</div>
      <div class="col-eta">ETA</div>
      <div class="col-actions">Actions</div>
    </div>

    <div v-if="tasks.length === 0" class="empty-state">
      <i class="fas fa-inbox"></i>
      <p>No tasks found</p>
    </div>

    <div v-else class="tasks-container">
      <task-row 
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        @play="handlePlay"
        @pause="handlePause"
        @delete="handleDelete"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Task } from '../types';
import TaskRow from './TaskRow.vue';

interface Props {
  tasks: Task[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
  play: [id: string];
  pause: [id: string];
  delete: [id: string];
}>();

const handlePlay = (id: string) => {
  emit('play', id);
};

const handlePause = (id: string) => {
  emit('pause', id);
};

const handleDelete = (id: string) => {
  if (confirm('Are you sure you want to delete this task?')) {
    emit('delete', id);
  }
};
</script>

<style scoped>
.task-list {
  background-color: white;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.table-header {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr 1fr 1fr;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  background-color: var(--bg-gray);
  border-bottom: 1px solid var(--border-gray);
  font-weight: 600;
  color: var(--neutral-gray);
  font-size: 13px;
  position: sticky;
  top: 0;
}

.col-file,
.col-progress,
.col-speed,
.col-eta,
.col-actions {
  display: flex;
  align-items: center;
}

.col-actions {
  justify-content: flex-end;
}

.tasks-container {
  max-height: calc(100vh - 240px);
  overflow-y: auto;
}

.empty-state {
  padding: var(--spacing-2xl);
  text-align: center;
  color: var(--neutral-gray);
}

.empty-state i {
  font-size: 48px;
  margin-bottom: var(--spacing-lg);
  opacity: 0.5;
}

.empty-state p {
  font-size: 14px;
}

@media (max-width: 1200px) {
  .table-header {
    grid-template-columns: 1fr 1.5fr 1fr 1fr;
  }

  .col-speed {
    display: none;
  }
}

@media (max-width: 768px) {
  .table-header {
    grid-template-columns: 1fr 1fr;
  }

  .col-eta,
  .col-actions {
    display: none;
  }
}
</style>
