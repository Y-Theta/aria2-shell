<template>
    <div class="app-layout">
        <sidebar ref="sidebarRef" @menu-change="handleMenuChange" />

        <div class="main-content">
            <!-- 
                这里不再加载数据。
                后续每个业务模块自己负责自己的数据加载。
                如果你使用 vue-router，可以放 router-view。
            -->
            <router-view />
        </div>

        <button
            class="floating-settings-button"
            type="button"
            :aria-label="t('settings.title') || '设置'"
            @click="showSettings = true"
        >
            <span class="floating-settings-icon-wrap">
                <i class="fas fa-gear floating-settings-icon" aria-hidden="true"></i>
            </span>
        </button>

        <!-- 设置面板 -->
        <settings-panel v-model:visible="showSettings" />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import Sidebar from './components/Sidebar.vue'
import SettingsPanel from './components/SettingsPanel.vue'

const { t } = useI18n()
const router = useRouter()

// const sidebarRef = ref<InstanceType<typeof Sidebar> | null>(null)
const showSettings = ref(false)

onMounted(() => {
    window.addEventListener('menu-change', handleWindowMenuChange)
})

onUnmounted(() => {
    window.removeEventListener('menu-change', handleWindowMenuChange)
})

const openMenu = (menu: string) => {
    if (menu === 'settings') {
        showSettings.value = true
        return
    }

    /**
     * 入口模块不再关心具体业务数据。
     * 这里只负责菜单跳转。
     *
     * 你可以根据自己的路由规则调整这里。
     */
    router.push({
        name: menu,
    })
}

const handleWindowMenuChange = (event: Event) => {
    const customEvent = event as CustomEvent
    openMenu(customEvent.detail?.menu || 'active')
}

const handleMenuChange = (event: any) => {
    openMenu(event.detail?.menu || 'active')
}
</script>

<style scoped>
.app-layout {
    display: flex;
    height: 100vh;
    width: 100%;
    background-color: var(--app-bg);
}

.main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    width: 100%;
    height: 100vh;
    overflow: hidden;
}

.floating-settings-button {
    position: fixed;
    right: 28px;
    bottom: 28px;
    z-index: 1200;
    width: 56px;
    height: 56px;
    border: none;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary), var(--primary-hover));
    color: var(--text-inverse);
    box-shadow: 0 10px 24px var(--button-shadow);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition:
        transform 0.2s ease,
        box-shadow 0.2s ease,
        background 0.2s ease;
}

.floating-settings-button:hover {
    transform: translateY(-2px) scale(1.06);
    box-shadow: 0 14px 30px var(--button-shadow-hover);
    background: linear-gradient(135deg, var(--primary-blue), var(--primary));
}

.floating-settings-icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
}

.floating-settings-icon {
    font-size: 20px;
    line-height: 1;
    transition: transform 0.2s ease;
}

.floating-settings-button:hover .floating-settings-icon {
    transform: scale(1.08);
}

/* 移动端保持现状：隐藏桌面悬浮设置按钮 */
@media (max-width: 768px) {
    .floating-settings-button { display: none; }
    
    .app-layout {
        height: 100dvh;
        overflow: hidden;
    }

    .main-content {
        height: calc(100dvh - 64px);
        padding-bottom: 64px;
        overflow-y: auto;
        overflow-x: hidden;
        -webkit-overflow-scrolling: touch;
    }

    :deep(.sidebar) {
        height: 64px;
        min-height: 64px;
        max-height: 64px;
        overflow: visible;
        overscroll-behavior: none;
    }
}
</style>