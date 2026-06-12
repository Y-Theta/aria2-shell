<template>
  <div class="progress-container">
    <div class="progress-bar" :class="statusClass">
      <div class="progress-fill" :style="{ width: progress + '%' }"></div>
    </div>
    <span class="progress-text">{{ progress }}%</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { TaskStatus } from '../types';

interface Props {
  progress: number; // 0-100
  status?: TaskStatus;
}

const props = withDefaults(defineProps<Props>(), {
  status: 'downloading',
});

const statusClass = computed(() => `status-${props.status}`);
</script>

<style scoped>
.progress-container {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
  min-width: 0;
}

.progress-bar {
  flex: 1;
  height: 24px;
  background-color: var(--light-gray);
  border-radius: var(--radius-md);
  overflow: hidden;
  position: relative;
}

.progress-bar.status-downloading .progress-fill {
  background-color: var(--status-downloading);
}

.progress-bar.status-seeding .progress-fill {
  background-color: var(--status-seeding);
}

.progress-bar.status-paused .progress-fill {
  background-color: var(--status-paused);
}

.progress-bar.status-completed .progress-fill {
  background-color: var(--status-completed);
}

.progress-bar.status-error .progress-fill {
  background-color: var(--status-error);
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-text {
  font-size: 12px;
  font-weight: 600;
  color: var(--neutral-gray);
  min-width: 35px;
  text-align: right;
}
</style>
