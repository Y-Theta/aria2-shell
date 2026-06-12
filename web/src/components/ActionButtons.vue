<template>
  <div class="action-buttons">
    <button 
      class="btn-icon" 
      :title="isPlaying ? 'Pause' : 'Resume'"
      @click="handlePlayPause"
      v-if="showPlayButton"
    >
      <i :class="isPlaying ? 'fas fa-pause' : 'fas fa-play'"></i>
    </button>

    <button 
      class="btn-icon" 
      title="Delete"
      @click="$emit('delete')"
    >
      <i class="fas fa-trash"></i>
    </button>

    <button 
      class="btn-icon" 
      title="More options"
      @click="toggleMenu"
    >
      <i class="fas fa-ellipsis-h"></i>
    </button>

    <div v-if="showMenu" class="action-menu">
      <div class="menu-item" @click="handleOpenFile">
        <i class="fas fa-folder-open"></i>
        <span>Open Folder</span>
      </div>
      <div class="menu-item" @click="handleCopyHash">
        <i class="fas fa-copy"></i>
        <span>Copy Hash</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { TaskStatus } from '../types';

interface Props {
  status: TaskStatus;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  delete: [];
  play: [];
  pause: [];
}>();

const showMenu = ref(false);

const isPlaying = computed(() => props.status === 'downloading' || props.status === 'seeding');
const showPlayButton = computed(() => props.status !== 'completed' && props.status !== 'error');

const handlePlayPause = () => {
  if (isPlaying.value) {
    emit('pause');
  } else {
    emit('play');
  }
  showMenu.value = false;
};

const toggleMenu = () => {
  showMenu.value = !showMenu.value;
};

const handleOpenFile = () => {
  // This would trigger file manager or actual file opening
  console.log('Open folder');
  showMenu.value = false;
};

const handleCopyHash = () => {
  console.log('Copy hash');
  showMenu.value = false;
};
</script>

<style scoped>
.action-buttons {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
  position: relative;
}

.btn-icon {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-gray);
  color: var(--neutral-gray);
  border: 1px solid var(--border-gray);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
}

.btn-icon:hover {
  background-color: var(--light-blue);
  color: var(--primary-blue);
  border-color: var(--primary-blue);
}

.action-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: white;
  border: 1px solid var(--border-gray);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  z-index: 10;
  min-width: 160px;
  margin-top: var(--spacing-xs);
}

.menu-item {
  padding: var(--spacing-sm) var(--spacing-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 14px;
}

.menu-item:hover {
  background-color: var(--bg-gray);
}

.menu-item:first-child {
  border-radius: var(--radius-md) var(--radius-md) 0 0;
}

.menu-item:last-child {
  border-radius: 0 0 var(--radius-md) var(--radius-md);
}

.menu-item i {
  width: 16px;
  text-align: center;
  color: var(--neutral-gray);
}
</style>
