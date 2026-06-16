import { createRouter, createWebHashHistory } from 'vue-router'

import ActiveTasks from '../views/ActiveTasks.vue'
import CompletedTasks from '../views/CompletedTasks.vue'
import PausedTasks from '../views/PausedTasks.vue'
import Torrents from '../views/Torrents.vue'

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
    ],
})

export default router