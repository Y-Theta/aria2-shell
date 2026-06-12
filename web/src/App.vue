<template>
  <div class="app-layout">
    <sidebar ref="sidebarRef" @menu-change="handleMenuChange" />
    <div class="main-content">
      <top-bar @search="handleSearch" />
      <div class="content-area">
        <task-list 
          :tasks="filteredTasks"
          @play="handlePlay"
          @pause="handlePause"
          @delete="handleDelete"
        />
      </div>
      <bottom-stats :stats="stats" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { Task, Stats } from './types';
import Sidebar from './components/Sidebar.vue';
import TopBar from './components/TopBar.vue';
import TaskList from './components/TaskList.vue';
import BottomStats from './components/BottomStats.vue';
import apiClient from './api/client';

const tasks = ref<Task[]>([]);
const stats = ref<Stats>({
  totalDownloadSpeed: 0,
  totalUploadSpeed: 0,
  activeTasks: 0,
  completedTasks: 0,
  pausedTasks: 0,
});

const currentMenu = ref('active');
const searchQuery = ref('');

const filteredTasks = computed(() => {
  let result = tasks.value;

  // Filter by menu
  if (currentMenu.value === 'completed') {
    result = result.filter(t => t.status === 'completed');
  } else if (currentMenu.value === 'paused') {
    result = result.filter(t => t.status === 'paused');
  } else if (currentMenu.value === 'torrents') {
    result = result.filter(t => t.filename.endsWith('.torrent'));
  } else if (currentMenu.value === 'active') {
    result = result.filter(t => t.status === 'downloading' || t.status === 'seeding');
  }

  // Filter by search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(t => t.filename.toLowerCase().includes(query));
  }

  return result;
});

// Load data on mount
onMounted(async () => {
  await loadData();
  // Simulate real-time updates
  setInterval(loadData, 5000);
  
  // Listen for menu changes from window
  window.addEventListener('menu-change', (event: any) => {
    currentMenu.value = event.detail.menu;
  });
});

const loadData = async () => {
  try {
    tasks.value = await apiClient.getTasks();
    stats.value = await apiClient.getStats();
  } catch (error) {
    console.error('Failed to load data:', error);
  }
};

const handleMenuChange = (event: any) => {
  currentMenu.value = event.detail?.menu || 'active';
};

const handleSearch = (query: string) => {
  searchQuery.value = query;
};

const handlePlay = async (id: string) => {
  try {
    await apiClient.resumeTask(id);
    const task = tasks.value.find(t => t.id === id);
    if (task) {
      task.status = 'downloading';
    }
  } catch (error) {
    console.error('Failed to resume task:', error);
  }
};

const handlePause = async (id: string) => {
  try {
    await apiClient.pauseTask(id);
    const task = tasks.value.find(t => t.id === id);
    if (task) {
      task.status = 'paused';
    }
  } catch (error) {
    console.error('Failed to pause task:', error);
  }
};

const handleDelete = async (id: string) => {
  try {
    await apiClient.deleteTask(id);
    tasks.value = tasks.value.filter(t => t.id !== id);
  } catch (error) {
    console.error('Failed to delete task:', error);
  }
};
</script>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  width: 100%;
  background-color: #f5f5f5;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

.content-area {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-lg);
}
</style>
