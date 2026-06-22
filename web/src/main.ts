import { createApp } from 'vue'
import '@fortawesome/fontawesome-free/css/all.css'
import './styles/main.css'
import App from './App.vue'
import { i18n } from './i18n'
import router from './router'
import { initSettings } from './services/settings'

// 初始化设置和主题
initSettings()

createApp(App)
 .use(i18n)
 .use(router)
 .mount('#app')