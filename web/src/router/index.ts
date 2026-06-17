import { createRouter, createWebHashHistory } from 'vue-router'

import ActiveTasks from '../views/ActiveTasks.vue'
import CompletedTasks from '../views/CompletedTasks.vue'
import PausedTasks from '../views/PausedTasks.vue'
import Torrents from '../views/Torrents.vue'
import SettingsPage from '../views/SettingsPage.vue'

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/',
            redirect: '/active',
        },
        {
            path: '/active',
            name: 'active',
            component: ActiveTasks,
        },
        {
            path: '/completed',
            name: 'completed',
            component: CompletedTasks,
        },
        {
            path: '/paused',
            name: 'paused',
            component: PausedTasks,
        },
        {
            path: '/torrents',
            name: 'torrents',
            component: Torrents,
        },
        {
            path: '/settings',
            name: 'settings',
            component: SettingsPage,
        },
    ],
})

export default router