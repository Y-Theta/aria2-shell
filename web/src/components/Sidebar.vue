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

        <button class="mobile-menu-btn" type="button" @click="toggleMobileMenu">
            <i class="fas fa-bars"></i>
        </button>

        <nav class="nav-menu" :class="{ 'mobile-open': isMobileMenuOpen }">
            <router-link
                v-for="item in menuItems"
                :key="item.id"
                class="nav-item"
                active-class="active"
                :to="item.to"
                @click="closeMobileMenu"
            >
                <i :class="item.icon"></i>

                <span v-if="!isCollapsed" class="nav-label">
                    {{ t(item.labelKey) }}
                </span>

                <span v-if="!isCollapsed && item.badge" class="badge">
                    {{ item.badge }}
                </span>
            </router-link>
        </nav>

        <div class="sidebar-footer">
            <button class="nav-item settings-item" type="button" @click="openSettings">
                <i class="fas fa-cog"></i>

                <span v-if="!isCollapsed" class="nav-label">
                    {{ t('sidebar.settings') }}
                </span>
            </button>
        </div>
    </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

interface MenuItem {
    id: string
    labelKey: string
    icon: string
    to: string
    badge?: number
}

const { t } = useI18n()

const emit = defineEmits<{
    'menu-change': [event: { detail: { menu: string } }]
}>()

const isCollapsed = ref(false)
const isMobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
    isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
    isMobileMenuOpen.value = false
}

const menuItems: MenuItem[] = [
    { id: 'active', labelKey: 'sidebar.active', icon: 'fas fa-circle-play', to: '/active', badge: 2 },
    { id: 'completed', labelKey: 'sidebar.completed', icon: 'fas fa-circle-check', to: '/completed' },
    { id: 'paused', labelKey: 'sidebar.paused', icon: 'fas fa-circle-pause', to: '/paused' },
    { id: 'torrents', labelKey: 'sidebar.torrents', icon: 'fas fa-file-arrow-down', to: '/torrents' },
]

const toggleCollapse = () => {
    isCollapsed.value = !isCollapsed.value
}

const openSettings = () => {
    closeMobileMenu()

    const event = {
        detail: {
            menu: 'settings',
        },
    }

    emit('menu-change', event)
    window.dispatchEvent(new CustomEvent('menu-change', event))
}
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

.settings-item {
    width: 100%;
    border: none;
    background: transparent;
    font: inherit;
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

.mobile-menu-btn {
    display: none;
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
        justify-content: space-between;

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

    .mobile-menu-btn {
        display: flex;
        width: 64px;
        height: 100%;

        border: none;
        background: transparent;
        color: var(--neutral-gray);
        cursor: pointer;

        align-items: center;
        justify-content: center;

        font-size: 20px;
        transition: all 0.2s ease;
    }

    .mobile-menu-btn:hover {
        color: var(--primary-blue);
        background-color: rgba(31, 111, 235, 0.05);
    }

    .nav-menu {
        position: absolute;
        left: var(--spacing-sm);
        right: var(--spacing-sm);
        bottom: calc(64px + var(--spacing-sm));

        display: none;
        flex-direction: column;
        gap: var(--spacing-xs);

        padding: var(--spacing-sm);
        border: 1px solid var(--sidebar-border);
        border-radius: 12px;
        background-color: var(--sidebar-bg);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }

    .nav-menu.mobile-open {
        display: flex;
    }

    .sidebar-footer {
        display: flex;
        width: 64px;
        height: 100%;
        padding: 0;
        border-top: none;
        margin-left: auto;
    }

    .nav-item,
    .sidebar.collapsed .nav-item {
        height: 44px;
        flex: none;

        padding: 0 var(--spacing-md);
        gap: var(--spacing-sm);

        justify-content: flex-start;
        align-items: center;
        flex-direction: row;

        border-right: none;
        border-top: none;
        border-radius: 8px;
    }

    .nav-item.active,
    .sidebar.collapsed .nav-item.active {
        border-right: none;
        border-top: none;
        background-color: rgba(31, 111, 235, 0.08);
    }

    .sidebar-footer .nav-item,
    .sidebar.collapsed .sidebar-footer .nav-item {
        width: 100%;
        height: 100%;

        padding: 0;
        gap: 0;

        justify-content: center;
        align-items: center;
        flex-direction: column;

        border-radius: 0;
    }

    .nav-item i {
        font-size: 18px;
        width: 20px;
    }

    .nav-label {
        display: inline;
        flex: 1;
        white-space: nowrap;
    }

    .badge {
        display: inline-block;
    }

    .sidebar-footer .nav-label,
    .sidebar-footer .badge {
        display: none;
    }
}
</style>