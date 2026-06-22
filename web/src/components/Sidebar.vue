<template>
    <aside class="sidebar" :class="{ collapsed: isCollapsed, 'is-mobile': isMobile }">
        <div class="sidebar-header">
            <div class="logo" @click="toggleCollapse">
                <i class="fas fa-download"></i>
                <span v-if="!isCollapsed && !isMobile" class="logo-text">Bitstream</span>
            </div>

            <button class="collapse-btn" type="button" @click="toggleCollapse" v-if="!isMobile">
                <i :class="isCollapsed ? 'fas fa-angle-right' : 'fas fa-angle-left'"></i>
            </button>
        </div>

        <nav class="nav-menu">
            <div v-if="!isCollapsed && !isMobile" class="nav-section-title">{{ t('sidebar.status') }}</div>
            <template v-if="!isMobile">
                <router-link v-for="item in statusMenuItems" :key="item.id" class="nav-item" active-class="active"
                    :to="item.to">
                    <i :class="item.icon"></i>
                    <span v-if="!isCollapsed" class="nav-label">{{ t(item.labelKey) }}</span>
                    <span v-if="!isCollapsed && item.badge" class="badge">{{ item.badge }}</span>
                </router-link>
            </template>

            <div v-if="!isCollapsed && !isMobile" class="nav-section-title">{{ t('sidebar.features') }}</div>
            <template v-if="!isMobile">
                <router-link class="nav-item" active-class="active" to="/settings">
                    <i class="fas fa-cog"></i>
                    <span v-if="!isCollapsed" class="nav-label">{{ t('sidebar.settings') }}</span>
                </router-link>
            </template>
        </nav>

        <div class="sidebar-footer" v-if="!isMobile">
            <button class="nav-item logout-btn" type="button" @click="showLogoutConfirm" v-if="isAuthenticated">
                <i class="fas fa-right-from-bracket"></i>
                <span v-if="!isCollapsed" class="nav-label">{{ t('common.logout') }}</span>
            </button>
        </div>

        <!-- 移动端布局 -->
        <template v-else>
            <router-link class="mobile-bottom-nav" :to="activeMenuItem.to" @click="toggleMobileMenu">
                <i :class="activeMenuItem.icon"></i>
                <span class="nav-label">{{ t(activeMenuItem.labelKey) }}</span>
            </router-link>
            <div v-if="isMobileMenuOpen" class="mobile-menu-dropdown">
                <div class="mobile-menu-section">{{ t('sidebar.status') }}</div>
                <router-link v-for="item in statusMenuItems" :key="item.id" class="nav-item" active-class="active"
                    :to="item.to" @click="selectMenuItem(item)">
                    <i :class="item.icon"></i>
                    <span class="nav-label">{{ t(item.labelKey) }}</span>
                    <span v-if="item.badge" class="badge">{{ item.badge }}</span>
                </router-link>
                <div class="mobile-menu-section">{{ t('sidebar.features') }}</div>
                <router-link class="nav-item" active-class="active" to="/settings" @click="selectMenuItem(settingItem)">
                    <i class="fas fa-cog"></i>
                    <span class="nav-label">{{ t('sidebar.settings') }}</span>
                </router-link>
                <div class="mobile-menu-divider"></div>
                <button class="nav-item logout-btn" type="button" @click="showLogoutConfirm" v-if="isAuthenticated">
                    <i class="fas fa-right-from-bracket"></i>
                    <span class="nav-label">{{ t('common.logout') }}</span>
                </button>
            </div>
        </template>

        <ConfirmDialog v-model:visible="showConfirmLogout" :title="t('common.confirmLogoutTitle')"
            :message="t('common.confirmLogoutMessage')" @confirm="confirmLogout" />
    </aside>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../services/auth'
import ConfirmDialog from './ConfirmDialog.vue'

interface MenuItem {
    id: string
    labelKey: string
    icon: string
    to: string
    badge?: number
}

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const { logout, isAuthenticated } = useAuth()
const isCollapsed = ref(false)
const isMobile = ref(false)
const isMobileMenuOpen = ref(false)
const showConfirmLogout = ref(false)

const statusMenuItems: MenuItem[] = [
    { id: 'active', labelKey: 'sidebar.active', icon: 'fas fa-circle-play', to: '/active', badge: 2 },
    { id: 'completed', labelKey: 'sidebar.completed', icon: 'fas fa-circle-check', to: '/completed' },
    { id: 'paused', labelKey: 'sidebar.paused', icon: 'fas fa-circle-pause', to: '/paused' },
    { id: 'torrents', labelKey: 'sidebar.torrents', icon: 'fas fa-file-arrow-down', to: '/torrents' },
]

const settingItem: MenuItem = {
    id: 'settings',
    labelKey: 'sidebar.settings',
    icon: 'fas fa-cog',
    to: '/settings'
}

const allMenuItems = [...statusMenuItems, settingItem]

const activeMenuItem = computed(() => {
    return allMenuItems.find(item => route.path === item.to) || statusMenuItems[0]
})

const showLogoutConfirm = () => {
    showConfirmLogout.value = true
}

const confirmLogout = () => {
    logout()
    router.push('/login')
}

const selectMenuItem = (_item: MenuItem) => {
    closeMobileMenu()
}

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
    min-height: 56px;
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
    height: auto;
}

.logout-btn {
    border: none;
    background: transparent;
    padding: 8px var(--spacing-md);
    margin: 0 var(--spacing-xs);
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    color: var(--error-red);
    cursor: pointer;
    transition: all 0.2s ease;
    font-weight: 500;
    border-radius: 6px;
}

.logout-btn:hover {
    color: var(--error-red);
    background-color: rgba(220, 53, 69, 0.1);
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

.mobile-menu-divider {
    height: 1px;
    background-color: var(--border-gray);
    margin: var(--spacing-sm) var(--spacing-xs);
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
        min-width: 144px;
    }

    .sidebar.is-mobile .nav-item.menu-toggle {
        width: 64px;
        flex: none;
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

    .sidebar.is-mobile .mobile-menu-dropdown .logout-btn {
        height: auto;
        padding: 8px var(--spacing-md);
        margin: 0 var(--spacing-xs);
        flex-direction: row;
        justify-content: flex-start;
        border-radius: 6px;
        color: var(--error-red);
        display: flex;
        width: calc(100% - var(--spacing-md));
    }

    .sidebar.is-mobile .mobile-menu-dropdown .logout-btn:hover {
        background-color: rgba(220, 53, 69, 0.1);
    }

    .mobile-bottom-nav {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--spacing-sm) var(--spacing-lg);
        background-color: var(--panel-bg);
        color: var(--primary-blue);
        text-decoration: none;
        gap: var(--spacing-xs);
        transition: all 0.2s ease;
        height: 100%;
    }

    .mobile-bottom-nav:hover {
        background-color: var(--bg-gray);
    }

    .mobile-bottom-nav .nav-label {
        font-size: 12px;
        font-weight: 600;
        display: block;
    }
}
</style>