<template>
    <aside class="sidebar" :class="{ collapsed: isCollapsed, 'is-mobile': isMobile }">
        <div class="sidebar-header">
            <div class="connection-status clickable" :class="{ connected: isConnected, disconnected: !isConnected }" @click="toggleCollapse">
                <span class="status-dot"></span>
                <div v-if="!isCollapsed && !isMobile" class="status-content">
                    <span class="status-label">{{ isConnected ? t('connection.connected') : t('connection.disconnected') }}</span>
                    <span v-if="isConnected && version" class="version-text">aria2 {{ version }}</span>
                </div>
                <!-- 收起时只显示圆点，不显示图标 -->
            </div>

            <button class="collapse-btn" type="button" @click.stop="toggleCollapse" v-if="!isMobile">
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

        <!-- 移动端底部导航 -->
        <template v-else>
            <!-- 左侧：菜单按钮 -->
            <button class="mobile-nav-menu-btn" type="button" @click="toggleMobileMenu">
                <i class="fas fa-bars"></i>
            </button>
            
            <!-- 中间：连接状态 -->
            <div class="mobile-connection-status" :class="{ connected: isConnected, disconnected: !isConnected }" :title="isConnected ? (version ? `aria2 ${version} - ${t('connection.connected')}` : t('connection.connected')) : t('connection.disconnected')">
                <i v-if="isConnected" class="fas fa-circle-check"></i>
                <i v-else class="fas fa-circle-xmark"></i>
            </div>
            
            <!-- 右侧：设置 -->
            <nav class="mobile-nav-right">
                <router-link class="mobile-nav-item" active-class="active" to="/settings">
                    <i class="fas fa-cog"></i>
                </router-link>
            </nav>
        </template>

        <!-- 移动端弹出菜单 -->
        <teleport to="body">
            <Transition name="fade">
                <div v-if="isMobileMenuOpen" class="mobile-menu-overlay" @click="closeMobileMenu">
                    <Transition name="slide-up">
                        <div class="mobile-menu-dialog" @click.stop>
                            <div class="mobile-menu-content">
                                <div class="mobile-menu-header">
                                    <span>{{ t('sidebar.status') }}</span>
                                </div>
                                <router-link v-for="item in statusMenuItems" :key="item.id" class="mobile-menu-item"
                                    active-class="active" :to="item.to" @click="closeMobileMenu">
                                    <i :class="item.icon"></i>
                                    <span class="menu-label">{{ t(item.labelKey) }}</span>
                                </router-link>
                            </div>
                        </div>
                    </Transition>
                </div>
            </Transition>
        </teleport>

        <ConfirmDialog v-model:visible="showConfirmLogout" :title="t('common.confirmLogoutTitle')"
            :message="t('common.confirmLogoutMessage')" @confirm="confirmLogout" />
    </aside>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuth } from '../../services/auth.ts'
import { useDashboardStore } from '../../stores/dashboardStore.ts'
import type { MenuItem } from '@common/types'
import ConfirmDialog from '../dialogs/ConfirmDialog.vue'

const { t } = useI18n()
const router = useRouter()
const { logout, isAuthenticated } = useAuth()
const dashboard = useDashboardStore()
const isConnected = computed(() => dashboard.isConnected.value)
const version = computed(() => dashboard.getVersion.value)

const isCollapsed = ref(false)
const isMobile = ref(false)
const isMobileMenuOpen = ref(false)
const showConfirmLogout = ref(false)

const statusMenuItems: MenuItem[] = [
    { id: 'active', labelKey: 'sidebar.active', icon: 'fas fa-circle-play', to: '/active' },
    { id: 'paused', labelKey: 'sidebar.paused', icon: 'fas fa-circle-pause', to: '/paused' },
    { id: 'completed', labelKey: 'sidebar.completed', icon: 'fas fa-circle-check', to: '/completed' },
    { id: 'torrents', labelKey: 'sidebar.torrents', icon: 'fas fa-file-arrow-down', to: '/torrents' },
]

const showLogoutConfirm = () => {
    showConfirmLogout.value = true
}

const confirmLogout = () => {
    logout()
    router.push('/login')
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
    padding-left: var(--spacing-sm);
    padding-right: var(--spacing-sm);
    border-bottom: 1px solid var(--sidebar-border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 56px;
}

.connection-status {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-weight: 500;
    color: var(--text-secondary);
    overflow: hidden;
    flex: 1;
    min-width: 0;
    padding: 8px var(--spacing-md);
    margin: 0 var(--spacing-xs);
}

.connection-status.clickable {
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.2s ease;
}

.connection-status .status-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
    transition: all 0.3s ease;
}

.connection-status.connected {
    color: var(--text-primary);
}

.connection-status.connected .status-dot {
    background-color: var(--success-green);
    box-shadow: 0 0 8px rgba(45, 164, 78, 0.5);
    animation: pulse-dot 2s infinite;
}

.connection-status.disconnected {
    color: var(--error-red, #ef4444);
}

.connection-status.disconnected .status-dot {
    background-color: var(--error-red, #ef4444);
}

.status-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
    white-space: nowrap;
    overflow: hidden;
    min-width: 0;
}

.status-label {
    font-size: 14px;
    font-weight: 600;
    line-height: 1.2;
}

.version-text {
    font-size: 11px;
    color: var(--text-muted);
    font-weight: 400;
    line-height: 1.2;
}

.connection-status.connected .version-text {
    color: var(--text-muted);
}

.connection-status.disconnected .version-text {
    color: rgba(239, 68, 68, 0.7);
}

/* 收起时居中显示圆点 */
.sidebar.collapsed .sidebar-header {
    justify-content: center;
    padding: var(--spacing-sm) 0;
}

.sidebar.collapsed .connection-status {
    justify-content: center;
    padding: 8px 0;
    margin: 0;
    width: 100%;
}

.sidebar.collapsed .connection-status .status-dot {
    width: 12px;
    height: 12px;
}

.sidebar.collapsed .collapse-btn {
    display: none;
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
    height: 40pt;
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
        padding: 0 var(--spacing-lg);
    }
    
    /* 左侧菜单按钮 */
    .mobile-nav-menu-btn {
        width: 48px;
        height: 48px;
        border: none;
        background: transparent;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--neutral-gray);
        font-size: 20px;
        cursor: pointer;
        border-radius: 8px;
        transition: all 0.2s ease;
    }
    
    .mobile-nav-menu-btn:hover,
    .mobile-nav-menu-btn:active {
        color: var(--primary-blue);
        background-color: rgba(31, 111, 235, 0.08);
    }
    
    /* 中间连接状态 */
    .mobile-connection-status {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 56px;
        height: 56px;
        flex-shrink: 0;
        border-radius: 16px;
        background-color: var(--success-green);
        margin: 0 -28px;
        margin-top: -24px;
        z-index: 10;
        transition: all 0.2s ease;
    }
    
    .mobile-connection-status i {
        font-size: 24px;
        color: white;
    }
    
    .mobile-connection-status.disconnected {
        background-color: var(--error-red);
    }

    /* 右侧设置 */
    .mobile-nav-right {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        height: 100%;
        width: 48px;
    }

    .mobile-nav-item {
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--neutral-gray);
        text-decoration: none;
        transition: all 0.2s ease;
        border-radius: 8px;
    }

    .mobile-nav-item i {
        font-size: 20px;
    }

    .mobile-nav-item.active {
        color: var(--primary-blue);
        background-color: rgba(31, 111, 235, 0.1);
    }

    .mobile-menu-overlay {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.36);
        backdrop-filter: blur(2px);
        display: flex;
        align-items: flex-end;
        justify-content: flex-start;
        z-index: 9999;
        padding-bottom: 80px;
        padding-left: var(--spacing-md);
    }

    :global(html[data-theme='dark']) .mobile-menu-overlay,
    :global(html.dark) .mobile-menu-overlay {
        background: rgba(0, 0, 0, 0.56);
    }

    .mobile-menu-dialog {
        background-color: var(--panel-bg);
        border-radius: 12px;
        box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.12);
        width: 160px;
        overflow: hidden;
        margin-left: 0;
    }

    .mobile-menu-content {
        padding: var(--spacing-xs);
    }
    
    .mobile-menu-header {
        padding: var(--spacing-sm) var(--spacing-md);
        font-size: 12px;
        font-weight: 600;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .mobile-menu-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
        padding: 12px var(--spacing-md);
        margin: 2px 0;
        border-radius: 8px;
        color: var(--text-primary);
        text-decoration: none;
        transition: all 0.2s ease;
        font-size: 14px;
    }
    
    .mobile-menu-item i {
        font-size: 18px;
        width: 20px;
        text-align: center;
        color: var(--neutral-gray);
    }

    .mobile-menu-item:hover,
    .mobile-menu-item:active {
        background-color: var(--bg-gray);
    }
    
    .mobile-menu-item.active {
        color: var(--primary-blue);
        background-color: rgba(31, 111, 235, 0.1);
    }
    
    .mobile-menu-item.active i {
        color: var(--primary-blue);
    }

    .sidebar.is-mobile.collapsed {
        width: 100%;
    }

    .sidebar.is-mobile .sidebar-header {
        display: none;
    }

    .sidebar.is-mobile .nav-menu {
        display: none;
    }

    .sidebar.is-mobile .sidebar-footer {
        display: none;
    }
}
</style>