<template>
    <div class="app-layout" :class="{ 'login-layout': isLoginPage }">
        <sidebar v-if="!isLoginPage" />

        <div class="main-content">
            <router-view />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from './components/Sidebar.vue'

const route = useRoute()
const isLoginPage = computed(() => route.path === '/login')
</script>

<style scoped>
.app-layout {
    display: flex;
    height: 100vh;
    width: 100%;
    background-color: var(--app-bg);
}

.app-layout.login-layout {
    display: block;
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

.app-layout.login-layout .main-content {
    flex: none;
    width: 100%;
}

@media (max-width: 768px) {
    .app-layout {
        height: 100dvh;
        overflow: hidden;
    }

    .app-layout.login-layout {
        height: 100dvh;
    }

    .main-content {
        height: 100dvh;
        overflow-y: auto;
        overflow-x: hidden;
        -webkit-overflow-scrolling: touch;
        padding-bottom: 64px;
    }

    .app-layout.login-layout .main-content {
        padding-bottom: 0;
    }
}
</style>