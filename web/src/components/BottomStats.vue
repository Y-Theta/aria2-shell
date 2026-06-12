<template>
  <div class="bottom-stats">
    <div class="stats-content">
      <div class="stat-item">
        <span class="stat-label">Total Speed:</span>
        <span class="stat-value">
          <span class="download">↓ {{ formatSpeed(stats.totalDownloadSpeed) }}</span>
          <span class="upload">↑ {{ formatSpeed(stats.totalUploadSpeed) }}</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Stats } from '../types';

interface Props {
  stats: Stats;
}

defineProps<Props>();

const formatSpeed = (bytesPerSec: number): string => {
  if (bytesPerSec === 0) return '0 B/s';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytesPerSec;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}/s`;
};
</script>

<style scoped>
.bottom-stats {
  height: var(--bottombar-height);
  background-color: white;
  border-top: 1px solid var(--border-gray);
  display: flex;
  align-items: center;
  padding: 0 var(--spacing-lg);
  box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.08);
}

.stats-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-xl);
  width: 100%;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.stat-label {
  font-weight: 600;
  color: var(--neutral-gray);
  font-size: 12px;
}

.stat-value {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.download,
.upload {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.download {
  color: var(--status-downloading);
}

.upload {
  color: var(--status-seeding);
}
</style>
