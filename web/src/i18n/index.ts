import { createI18n } from 'vue-i18n'
import zhCN from './locales/zh-CN'
import enUS from './locales/en-US'

type Locale = 'zh-CN' | 'en-US'

export const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS,
  },
})

// 更新语言的函数
export function setLocale(locale: Locale | string) {
  i18n.global.locale.value = locale as Locale
  localStorage.setItem('locale', locale)
}

// 获取当前语言
export function getLocale() {
  return i18n.global.locale.value
}