// API 基础配置
// 同域名部署时使用 '/api' 相对路径，跨域部署时通过 VITE_API_BASE_URL 配置
export const API_CONFIG = {
    baseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: 10000,
}