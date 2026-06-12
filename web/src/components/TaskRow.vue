<template>
  <div class="task-row">
    <div class="task-file">
      <div class="file-icon" :class="`icon-${getFileType(task.filename)}`">
        <i :class="getFileIcon(task.filename)"></i>
      </div>
      <div class="file-info">
        <div class="filename">{{ task.filename }}</div>
        <status-badge :status="task.status" />
      </div>
    </div>

    <div class="progress-col">
      <progress-bar :progress="task.progress" :status="task.status" />
      <span class="size-info">{{ formatBytes(task.completedSize) }} / {{ formatBytes(task.totalSize) }}</span>
    </div>

    <div class="speed-col">
      <div class="speed-item">
        <span class="label">↓</span>
        <span class="value">{{ formatSpeed(task.downloadSpeed) }}</span>
      </div>
      <div class="speed-item">
        <span class="label">↑</span>
        <span class="value">{{ formatSpeed(task.uploadSpeed) }}</span>
      </div>
    </div>

    <div class="eta-col">
      {{ formatEta(task.eta) }}
    </div>

    <div class="actions-col">
      <action-buttons 
        :status="task.status"
        @play="handlePlay"
        @pause="handlePause"
        @delete="handleDelete"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Task } from '../types';
import StatusBadge from './StatusBadge.vue';
import ProgressBar from './ProgressBar.vue';
import ActionButtons from './ActionButtons.vue';

interface Props {
  task: Task;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  play: [id: string];
  pause: [id: string];
  delete: [id: string];
}>();

const formatBytes = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

const formatSpeed = (bytesPerSec: number): string => {
  return formatBytes(bytesPerSec) + '/s';
};

const formatEta = (seconds: number | null): string => {
  if (seconds === null || seconds === 0) return '--';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
};

const getFileType = (filename: string): string => {
  if (filename.endsWith('.iso')) return 'iso';
  if (filename.endsWith('.torrent')) return 'torrent';
  if (filename.endsWith('.zip')) return 'archive';
  if (filename.endsWith('.mp4')) return 'video';
  return 'file';
};

const getFileIcon = (filename: string): string => {
  const type = getFileType(filename);
  const icons: Record<string, string> = {
    iso: 'fas fa-compact-disc',
    torrent: 'fas fa-magnet',
    archive: 'fas fa-file-archive',
    video: 'fas fa-film',
    file: 'fas fa-file',
  };
  return icons[type];
};

const handlePlay = () => {
  emit('play', props.task.id);
};

const handlePause = () => {
  emit('pause', props.task.id);
};

const handleDelete = () => {
  emit('delete', props.task.id);
};
</script>

<style scoped>
.task-row {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr 1fr 1fr;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-gray);
  align-items: center;
  background-color: white;
  transition: background-color 0.2s ease;
}

.task-row:hover {
  background-color: var(--bg-gray);
}

.task-file {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  min-width: 0;
}

.file-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.file-icon.icon-iso,
.file-icon.icon-torrent {
  background-color: rgba(31, 111, 235, 0.1);
  color: var(--primary-blue);
}

.file-icon.icon-archive {
  background-color: rgba(251, 133, 0, 0.1);
  color: var(--warning-orange);
}

.file-icon.icon-video {
  background-color: rgba(45, 164, 78, 0.1);
  color: var(--success-green);
}

.file-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  min-width: 0;
}

.filename {
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #333;
}

.progress-col {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  min-width: 0;
}

.size-info {
  font-size: 12px;
  color: var(--neutral-gray);
}

.speed-col {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.speed-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 12px;
}

.label {
  color: var(--neutral-gray);
  font-weight: 600;
}

.value {
  color: #333;
  font-weight: 500;
}

.eta-col {
  text-align: right;
  font-size: 14px;
  color: var(--neutral-gray);
  font-weight: 500;
}

.actions-col {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 1200px) {
  .task-row {
    grid-template-columns: 1fr 1.5fr 1fr 1fr;
  }

  .speed-col {
    display: none;
  }
}

@media (max-width: 768px) {
  .task-row {
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-md);
  }

  .eta-col,
  .actions-col {
    display: none;
  }
}
</style>
