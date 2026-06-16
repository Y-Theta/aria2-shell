export type ThemeMode = 'light' | 'dark' | 'system'

const THEME_KEY = 'app-theme'

export function getTheme(): ThemeMode {
    const saved = localStorage.getItem(THEME_KEY) as ThemeMode | null

    if (saved === 'light' || saved === 'dark' || saved === 'system') {
        return saved
    }

    return 'system'
}

export function applyTheme(theme: ThemeMode) {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(THEME_KEY, theme)
}

export function initTheme() {
    const theme = getTheme()
    applyTheme(theme)
}