// 用户相关接口
export interface User {
    id: number;
    username: string;
    updated_at: number;
}

export interface UserConfig {
    id: number;
    user_id: number;
    key: string;
    value: string;
    updated_at: number;
}

// 设置相关接口
export type SettingValue = string | number | boolean | SavePath[];

export interface SavePath {
    label: string;
    path: string;
    isDefault?: boolean;
}

export type SettingKey =
    | 'autoStart'
    | 'minimizeToTray'
    | 'downloadPath'
    | 'maxActiveDownloads'
    | 'downloadLimit'
    | 'uploadLimit'
    | 'keepSeeding'
    | 'serverUrl'
    | 'secret'
    | 'timeout'
    | 'autoReconnect'
    | 'theme'
    | 'language'
    | 'showRegister'
    | 'savePaths'
    | 'btTrackerUrl'
    | 'btMaxUploadSpeed'
    | 'btMinSeedRatio'
    | 'btMinSeedTime'
    | 'httpProxyUrl'
    | 'httpProxyUser'
    | 'httpProxyPassword';

export interface SettingConfig {
    key: SettingKey;
    value: string;
    updated_at: number;
}

export interface SettingsState {
    [key: string]: SettingValue;
}

// 默认设置（可以被 web 和 server 项目覆盖）
export const DEFAULT_SETTINGS: SettingsState = {
    autoStart: false,
    minimizeToTray: true,
    downloadPath: '',
    maxActiveDownloads: 5,
    downloadLimit: 0,
    uploadLimit: 0,
    keepSeeding: true,
    serverUrl: 'http://127.0.0.1:8080',
    secret: '',
    timeout: 10,
    autoReconnect: true,
    theme: 'light',
    language: 'zh-CN',
    showRegister: false,
    savePaths: [
        {
            label: '默认',
            path: '',
            isDefault: true
        }
    ],
    btTrackerUrl: '',
    btMaxUploadSpeed: 0,
    btMinSeedRatio: 1.0,
    btMinSeedTime: 60,
    httpProxyUrl: '',
    httpProxyUser: '',
    httpProxyPassword: '',
};

// API 响应相关接口
export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
}

export interface ListResponse<T> extends ApiResponse {
    success: true;
    list: T[];
}

export interface DataResponse<T> extends ApiResponse {
    success: true;
    [key: string]: any;
}

export interface GidResponse extends ApiResponse {
    success: true;
    gid: string;
}

export interface LoginResponse {
    success: boolean;
    user?: User;
    token?: string;
    error?: string;
}

export interface RegisterResponse {
    success: boolean;
    user?: User;
    token?: string;
    error?: string;
}

export * from './task';
export * from './aria2';