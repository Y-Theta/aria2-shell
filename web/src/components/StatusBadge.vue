<template>
  <div class="status-badge" :class="statusClass">
    <span class="status-dot"></span>
    <span class="status-text">{{ statusLabel }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { TaskStatus } from '../types';

interface Props {
  status: TaskStatus;
}

const props = defineProps<Props>();

const statusLabel = computed(() => {
  const labels: Record<TaskStatus, string> = {
    downloading: 'Downloading',
    seeding: 'Seeding',
    paused: 'Paused',
    completed: 'Completed',
    error: 'Error',
  };
  return labels[props.status] || 'Unknown';
});

const statusClass = computed(() => `status-${props.status}`);
</script>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  width: fit-content;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.status-downloading {
  background-color: rgba(31, 111, 235, 0.15);
  color: var(--status-downloading);
}

.status-downloading .status-dot {
  background-color: var(--status-downloading);
}

.status-seeding {
  background-color: rgba(45, 164, 78, 0.15);
  color: var(--status-seeding);
}

.status-seeding .status-dot {
  background-color: var(--status-seeding);
}

.status-paused {
  background-color: rgba(110, 118, 129, 0.15);
  color: var(--status-paused);
}

.status-paused .status-dot {
  background-color: var(--status-paused);
}

.status-completed {
  background-color: rgba(45, 164, 78, 0.15);
  color: var(--status-completed);
}

.status-completed .status-dot {
  background-color: var(--status-completed);
}

.status-error {
  background-color: rgba(218, 54, 51, 0.15);
  color: var(--status-error);
}

.status-error .status-dot {
  background-color: var(--status-error);
}
</style>
