<template>
    <div class="app-layout">
        <sidebar />

        <div class="main-content">
            <router-view />
        </div>
    </div>
</template>

<script setup lang="ts">
import Sidebar from './components/Sidebar.vue'
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

@media (max-width: 768px) {
    .app-layout {
        height: 100dvh;
        overflow: hidden;
    }

    .main-content {
        height: 100dvh;
        overflow-y: auto;
        overflow-x: hidden;
        -webkit-overflow-scrolling: touch;
        padding-bottom: 64px;
    }
}
</style>