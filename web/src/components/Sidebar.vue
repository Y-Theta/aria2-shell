<template>
    <aside class="sidebar" :class="{ collapsed: isCollapsed, 'is-mobile': isMobile }">
        <div class="sidebar-header">
            <div class="logo" @click="toggleCollapse">
                <i class="fas fa-download"></i>
                <span v-if="!isCollapsed && !isMobile" class="logo-text">BitStream</span>
            </div>

            <button class="collapse-btn" type="button" @click="toggleCollapse" v-if="!isMobile">
                <i :class="isCollapsed ? 'fas fa-angle-right' : 'fas fa-angle-left'"></i>
            </button>
        </div>

        <nav class="nav-menu">
            <div v-if="!isCollapsed && !isMobile" class="nav-section-title">{{ t('sidebar.status') }}</div>
            <template v-if="!isMobile">
                <router-link
                    v-for="item in statusMenuItems"
                    :key="item.id"
                    class="nav-item"
                    active-class="active"
                    :to="item.to"
                >
                    <i :class="item.icon"></i>
                    <span v-if="!isCollapsed" class="nav-label">{{ t(item.labelKey) }}</span>
                    <span v-if="!isCollapsed && item.badge" class="badge">{{ item.badge }}</span>
                </router-link>
            </template>
            <template v-else>
                <div class="nav-item menu-toggle" @click="toggleMobileMenu">
                    <i class="fas fa-bars"></i>
                    <span v-if="isMobileMenuOpen" class="nav-label">{{ t('sidebar.menu') }}</span>
                </div>
                <div v-if="isMobileMenuOpen" class="mobile-menu-dropdown">
                    <div class="mobile-menu-section">{{ t('sidebar.status') }}</div>
                    <router-link
                        v-for="item in statusMenuItems"
                        :key="item.id"
                        class="nav-item"
                        active-class="active"
                        :to="item.to"
                        @click="closeMobileMenu"
                    >
                        <i :class="item.icon"></i>
                        <span class="nav-label">{{ t(item.labelKey) }}</span>
                        <span v-if="item.badge" class="badge">{{ item.badge }}</span>
                    </router-link>
                </div>
            </template>
        </nav>

        <div class="sidebar-footer">
            <div v-if="!isCollapsed && !isMobile" class="nav-section-title">{{ t('sidebar.features') }}</div>
            <router-link
                class="nav-item"
                active-class="active"
                to="/settings"
                @click="closeMobileMenu"
            >
                <i class="fas fa-cog"></i>
                <span v-if="!isCollapsed && !isMobile" class="nav-label">{{ t('sidebar.settings') }}</span>
            </router-link>
        </div>
    </aside>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

interface MenuItem {
    id: string
    labelKey: string
    icon: string
    to: string
    badge?: number
}

const { t } = useI18n()
const isCollapsed = ref(false)
const isMobile = ref(false)
const isMobileMenuOpen = ref(false)

const statusMenuItems: MenuItem[] = [
    { id: 'active', labelKey: 'sidebar.active', icon: 'fas fa-circle-play', to: '/active', badge: 2 },
    { id: 'completed', labelKey: 'sidebar.completed', icon: 'fas fa-circle-check', to: '/completed' },
    { id: 'paused', labelKey: 'sidebar.paused', icon: 'fas fa-circle-pause', to: '/paused' },
    { id: 'torrents', labelKey: 'sidebar.torrents', icon: 'fas fa-file-arrow-down', to: '/torrents' },
]

const toggleCollapse = () => {
    isCollapsed.value = !isCollapsed.value
}

const toggleMobileMenu = () => {
    isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
    isMobileMenuOpen.value = false
}

const checkIsMobile = () => {
    isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
})

onUnmounted(() => {
    window.removeEventListener('resize', checkIsMobile)
})
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
    color: var(--text-primary);
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
    padding: var(--spacing-sm) var(--spacing-sm);
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.nav-section-title {
    padding: var(--spacing-sm) var(--spacing-md) var(--spacing-xs);
    font-size: 12px;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    user-select: none;
}

.nav-item {
    padding: 8px var(--spacing-md);
    margin: 0 var(--spacing-xs);
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    color: var(--neutral-gray);
    text-decoration: none;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    font-weight: 500;
    border-radius: 6px;
}

.nav-item:hover {
    color: var(--primary-blue);
    background-color: rgba(31, 111, 235, 0.06);
}

.nav-item.active {
    color: var(--primary-blue);
    background-color: rgba(31, 111, 235, 0.1);
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
    color: var(--primary-blue);
    font-size: 13px;
    font-weight: 500;
    min-width: 20px;
    text-align: right;
}

.sidebar.collapsed .nav-item {
    justify-content: center;
    padding: var(--spacing-sm) 0;
    margin: 0;
    gap: 0;
}

.sidebar.collapsed .nav-item.active {
    border-right: none;
}

.sidebar-footer {
    padding: var(--spacing-sm) var(--spacing-sm);
    border-top: 1px solid var(--sidebar-border);
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.mobile-menu-dropdown {
    position: absolute;
    bottom: 100%;
    left: var(--spacing-sm);
    right: var(--spacing-sm);
    margin-bottom: var(--spacing-sm);
    padding: var(--spacing-sm);
    background-color: var(--sidebar-bg);
    border: 1px solid var(--sidebar-border);
    border-radius: 12px;
    box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.08);
    z-index: 1000;
}

.mobile-menu-section {
    padding: var(--spacing-sm) var(--spacing-md) var(--spacing-xs);
    font-size: 12px;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    user-select: none;
}

/* 手机端适配 */
@media (max-width: 768px) {
    .sidebar.is-mobile {
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        top: auto;
        z-index: 999;
        width: 100%;
        height: 64px;
        min-height: 64px;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        border-right: none;
        border-top: 1px solid var(--sidebar-border);
        overflow: visible;
        transition: none;
    }

    .sidebar.is-mobile.collapsed {
        width: 100%;
    }

    .sidebar.is-mobile .sidebar-header {
        display: none;
    }

    .sidebar.is-mobile .nav-menu {
        flex: none;
        padding: 0;
        flex-direction: row;
        gap: 0;
        height: 100%;
    }

    .sidebar.is-mobile .nav-section-title {
        display: none;
    }

    .sidebar.is-mobile .sidebar-footer {
        padding: 0;
        border-top: none;
        flex-direction: row;
        gap: 0;
        height: 100%;
    }

    .sidebar.is-mobile .nav-item {
        height: 100%;
        flex: none;
        padding: 0 var(--spacing-md);
        gap: var(--spacing-sm);
        justify-content: center;
        align-items: center;
        flex-direction: column;
        border-radius: 0;
        margin: 0;
    }

    .sidebar.is-mobile .nav-item.menu-toggle {
        width: 64px;
    }

    .sidebar.is-mobile .nav-item i {
        font-size: 20px;
    }

    .sidebar.is-mobile .nav-label,
    .sidebar.is-mobile .badge {
        display: none;
    }

    .sidebar.is-mobile .mobile-menu-dropdown .nav-label,
    .sidebar.is-mobile .mobile-menu-dropdown .badge {
        display: block;
    }

    .sidebar.is-mobile .mobile-menu-dropdown .nav-item {
        height: auto;
        padding: 8px var(--spacing-md);
        margin: 0 var(--spacing-xs);
        flex-direction: row;
        justify-content: flex-start;
        border-radius: 6px;
    }

    .sidebar.is-mobile .mobile-menu-dropdown .nav-item i {
        font-size: 16px;
    }
}
</style>