import { createApp } from 'vue'
import '@fortawesome/fontawesome-free/css/all.css'
import './styles/main.css'
import App from './App.vue'
import { i18n } from './i18n'
import { initTheme } from './services/theme.ts'
import router from './router'

initTheme()

createApp(App)
 .use(i18n)
 .use(router)
 .mount('#app')
