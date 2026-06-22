export type SettingValue = string | number | boolean

export type SettingKey =
    | 'autoStart'
    | 'minimizeToTray'
    | 'downloadPath'
    | 'maxActiveDownloads'
    | 'downloadLimit'
    | 'uploadLimit'
    | 'keepSeeding'
    | 'serverUrl'
    | 'timeout'
    | 'autoReconnect'
    | 'theme'
    | 'language'
    | 'compactMode'
    | 'showRegister'

export interface SettingConfig {
    key: SettingKey
    value: string
    created_at: number
    updated_at: number
}

export interface SettingsState {
    [key: string]: SettingValue
}

export const DEFAULT_SETTINGS: SettingsState = {
    autoStart: false,
    minimizeToTray: true,
    downloadPath: '',
    maxActiveDownloads: 5,
    downloadLimit: 0,
    uploadLimit: 0,
    keepSeeding: true,
    serverUrl: 'http://127.0.0.1:8080',
    timeout: 10,
    autoReconnect: true,
    theme: 'light',
    language: 'zh-CN',
    compactMode: false,
    showRegister: true,
}