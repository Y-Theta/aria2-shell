<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="logo">
        <i class="fas fa-download"></i>
        <span class="logo-text">BitStream</span>
      </div>
    </div>

    <nav class="nav-menu">
      <div 
        v-for="item in menuItems" 
        :key="item.id"
        class="nav-item"
        :class="{ active: activeMenu === item.id }"
        @click="selectMenu(item.id)"
      >
        <i :class="item.icon"></i>
        <span class="nav-label">{{ item.label }}</span>
        <span v-if="item.badge" class="badge">{{ item.badge }}</span>
      </div>
    </nav>

    <div class="sidebar-footer">
      <div 
        class="nav-item"
        :class="{ active: activeMenu === 'settings' }"
        @click="selectMenu('settings')"
      >
        <i class="fas fa-cog"></i>
        <span class="nav-label">Settings</span>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  badge?: number;
}

const emit = defineEmits<{
  'menu-change': [event: { detail: { menu: string } }];
}>();

const activeMenu = ref('active');

const menuItems: MenuItem[] = [
  { id: 'active', label: 'Active', icon: 'fas fa-circle-play', badge: 2 },
  { id: 'completed', label: 'Completed', icon: 'fas fa-circle-check' },
  { id: 'paused', label: 'Paused', icon: 'fas fa-circle-pause' },
  { id: 'torrents', label: 'Torrents', icon: 'fas fa-magnet' },
];

const selectMenu = (menuId: string) => {
  activeMenu.value = menuId;
  const event = new Event('menu-change', { bubbles: true });
  (event as any).detail = { menu: menuId };
  window.dispatchEvent(event);
};
</script>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  background-color: var(--sidebar-bg);
  border-right: 1px solid var(--sidebar-border);
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow-y: auto;
}

.sidebar-header {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--sidebar-border);
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  font-size: 18px;
  font-weight: 700;
  color: #333;
  cursor: pointer;
  transition: color 0.2s ease;
}

.logo:hover {
  color: var(--primary-blue);
}

.logo i {
  font-size: 24px;
}

.logo-text {
  user-select: none;
}

.nav-menu {
  flex: 1;
  padding: var(--spacing-md) 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.nav-item {
  padding: var(--spacing-md) var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  color: var(--neutral-gray);
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  font-weight: 500;
}

.nav-item:hover {
  color: var(--primary-blue);
  background-color: rgba(31, 111, 235, 0.05);
}

.nav-item.active {
  color: var(--primary-blue);
  background-color: rgba(31, 111, 235, 0.1);
  border-right: 3px solid var(--primary-blue);
}

.nav-item i {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.nav-label {
  flex: 1;
  white-space: nowrap;
}

.badge {
  background-color: var(--primary-blue);
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 11px;
  font-weight: 600;
  min-width: 20px;
  text-align: center;
}

.sidebar-footer {
  padding: var(--spacing-md) 0;
  border-top: 1px solid var(--sidebar-border);
}
</style>
