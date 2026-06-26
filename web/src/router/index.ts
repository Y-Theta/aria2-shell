import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuth } from '../services/auth'

import TaskListView from '../views/TaskListView.vue'
import SettingsPage from '../views/SettingsPage.vue'
import LoginPage from '../views/LoginPage.vue'

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/login',
            name: 'login',
            component: LoginPage,
        },
        {
            path: '/',
            redirect: '/active',
        },
        {
            path: '/active',
            name: 'active',
            component: TaskListView,
            meta: { requiresAuth: true },
        },
        {
            path: '/completed',
            name: 'completed',
            component: TaskListView,
            meta: { requiresAuth: true },
        },
        {
            path: '/paused',
            name: 'paused',
            component: TaskListView,
            meta: { requiresAuth: true },
        },
        {
            path: '/torrents',
            name: 'torrents',
            component: TaskListView,
            meta: { requiresAuth: true },
        },
        {
            path: '/settings',
            name: 'settings',
            component: SettingsPage,
            meta: { requiresAuth: true },
        },
    ],
})

// 路由守卫
router.beforeEach((to, _from) => {
    const { isAuthenticated } = useAuth()

    if (to.meta.requiresAuth && !isAuthenticated.value) {
        // 需要认证但未登录，跳转到登录页
        return '/login'
    } else if (to.path === '/login' && isAuthenticated.value) {
        // 已登录但访问登录页，跳转到首页
        return '/'
    }
})

export default router