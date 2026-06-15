<template>
    <aside class="sidebar" :class="{ collapsed: isCollapsed }">
        <div class="sidebar-header">
            <div class="logo" @click="toggleCollapse">
                <i class="fas fa-download"></i>
                <span v-if="!isCollapsed" class="logo-text">BitStream</span>
            </div>

            <button class="collapse-btn" type="button" @click="toggleCollapse">
                <i :class="isCollapsed ? 'fas fa-angle-right' : 'fas fa-angle-left'"></i>
            </button>
        </div>

        <nav class="nav-menu">
            <div v-for="item in menuItems" :key="item.id" class="nav-item" :class="{ active: activeMenu === item.id }"
                @click="selectMenu(item.id)">
                <i :class="item.icon"></i>

                <span v-if="!isCollapsed" class="nav-label">
                    {{ t(item.labelKey) }}
                </span>

                <span v-if="!isCollapsed && item.badge" class="badge">
                    {{ item.badge }}
                </span>
            </div>
        </nav>

        <div class="sidebar-footer">
            <div class="nav-item" :class="{ active: activeMenu === 'settings' }" @click="selectMenu('settings')">
                <i class="fas fa-cog"></i>

                <span v-if="!isCollapsed" class="nav-label">
                    {{ t('sidebar.settings') }}
                </span>
            </div>
        </div>
    </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

interface MenuItem {
    id: string;
    labelKey: string;
    icon: string;
    badge?: number;
}

const { t } = useI18n();

defineEmits<{
    'menu-change': [event: { detail: { menu: string } }];
}>();

const activeMenu = ref('active');
const isCollapsed = ref(false);

const menuItems: MenuItem[] = [
    { id: 'active', labelKey: 'sidebar.active', icon: 'fas fa-circle-play', badge: 2 },
    { id: 'completed', labelKey: 'sidebar.completed', icon: 'fas fa-circle-check' },
    { id: 'paused', labelKey: 'sidebar.paused', icon: 'fas fa-circle-pause' },
];

const toggleCollapse = () => {
    isCollapsed.value = !isCollapsed.value;
};

const selectMenu = (menuId: string) => {
    activeMenu.value = menuId;

    const event = new CustomEvent('menu-change', {
        bubbles: true,
        detail: {
            menu: menuId,
        },
    });

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
    transition: width 0.2s ease;
}

.sidebar.collapsed {
    width: 64px;
}

.sidebar-header {
    padding: var(--spacing-sm) var(--spacing-md);
    border-bottom: 1px solid var(--sidebar-border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 48px;
}

.logo {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-size: 18px;
    font-weight: 700;
    color: #333;
    cursor: pointer;
    transition: color 0.2s ease;
    overflow: hidden;
}

.logo:hover {
    color: var(--primary-blue);
}

.logo i {
    font-size: 22px;
    width: 24px;
    text-align: center;
    flex-shrink: 0;
}

.logo-text {
    user-select: none;
    white-space: nowrap;
}

.collapse-btn {
    width: 28px;
    height: 28px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: var(--neutral-gray);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    flex-shrink: 0;
}

.collapse-btn:hover {
    color: var(--primary-blue);
    background-color: rgba(31, 111, 235, 0.08);
}

.sidebar.collapsed .sidebar-header {
    justify-content: center;
    padding: var(--spacing-sm) 0;
}

.sidebar.collapsed .collapse-btn {
    display: none;
}

.nav-menu {
    flex: 1;
    padding: var(--spacing-sm) 0;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
}

.nav-item {
    padding: var(--spacing-sm) var(--spacing-lg);
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
    flex-shrink: 0;
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
    display: none;
    padding: var(--spacing-sm) 0;
    border-top: 1px solid var(--sidebar-border);
}

.sidebar.collapsed .nav-item {
    justify-content: center;
    padding: var(--spacing-sm) 0;
    gap: 0;
}

.sidebar.collapsed .nav-item.active {
    border-right-width: 3px;
}

/* 手机端适配：侧边栏变为底部固定导航栏 */
@media (max-width: 768px) {
    .sidebar {
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        top: auto;
        z-index: 1000;

        width: 100%;
        height: 64px;
        min-height: 64px;

        flex-direction: row;
        align-items: center;

        border-right: none;
        border-top: 1px solid var(--sidebar-border);
        background-color: var(--sidebar-bg);

        overflow: visible;
        transition: none;
    }

    .sidebar.collapsed {
        width: 100%;
    }

    .sidebar-header {
        display: none;
    }

    .nav-menu {
        flex: 1;
        height: 100%;
        padding: 0;

        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-around;
        gap: 0;
    }

    .sidebar-footer {
        display: flex;
        width: 25%;
        height: 100%;
        padding: 0;
        border-top: none;
    }

    .nav-item,
    .sidebar.collapsed .nav-item {
        height: 100%;
        flex: 1;

        padding: 0;
        gap: 0;

        justify-content: center;
        align-items: center;
        flex-direction: column;

        border-right: none;
        border-top: 3px solid transparent;
    }

    .nav-item.active,
    .sidebar.collapsed .nav-item.active {
        border-right: none;
        border-top: 3px solid var(--primary-blue);
        background-color: rgba(31, 111, 235, 0.08);
    }

    .nav-item i {
        font-size: 18px;
        width: auto;
    }

    .nav-label,
    .badge {
        display: none;
    }
}
</style>