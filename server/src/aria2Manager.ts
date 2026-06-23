import { Aria2Client } from "./aria2Client.js";
import { userService } from "./userService.js";

// 用户 Aria2Client 缓存
const clientCache = new Map<number, Aria2Client>();

// 默认配置
const DEFAULT_ARIA2_URL = "http://localhost:6800/jsonrpc";
const DEFAULT_TIMEOUT_MS = 10000;

/**
 * 获取用户配置的 Aria2Client
 */
export function getAria2Client(userId: number): Aria2Client {
    let client = clientCache.get(userId);
    if (client) {
        return client;
    }

    // 从用户配置中读取设置
    const urlConfig = userService.getUserConfig(userId, "serverUrl");
    const secretConfig = userService.getUserConfig(userId, "secret");

    const url = urlConfig?.value || DEFAULT_ARIA2_URL;
    const secret = secretConfig?.value || process.env.ARIA2_SECRET;

    client = new Aria2Client({
        url,
        secret,
        timeoutMs: DEFAULT_TIMEOUT_MS,
    });

    clientCache.set(userId, client);
    return client;
}

/**
 * 清除用户的 Aria2Client 缓存（当配置变更时调用）
 */
export function clearAria2ClientCache(userId: number): void {
    clientCache.delete(userId);
}

/**
 * 清除所有缓存
 */
export function clearAllCache(): void {
    clientCache.clear();
}