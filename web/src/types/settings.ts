import type {
    SettingValue as CommonSettingValue,
    SavePath as CommonSavePath,
    SettingKey as CommonSettingKey,
    SettingConfig as CommonSettingConfig,
    SettingsState as CommonSettingsState
} from "../../../common/types";

export type SettingValue = CommonSettingValue;
export interface SavePath extends CommonSavePath {}
export type SettingKey = CommonSettingKey;
export interface SettingConfig extends Omit<CommonSettingConfig, 'created_at'> {
    created_at?: number;
}
export interface SettingsState extends CommonSettingsState {}

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
    showRegister: false,
    savePaths: [
        {
            label: '默认',
            path: '',
            isDefault: true
        }
    ],
}