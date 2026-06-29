import { Aria2Client } from "./aria2Client.js";
import { getAria2Client } from "./aria2Manager.js";

// 连接状态缓存
interface ConnectionStatus {
    connected: boolean;
    version?: string;
    features?: string[];
    lastChecked: number;
    error?: string;
}

const statusCache = new Map<number, ConnectionStatus>();
const CHECK_INTERVAL_MS = 15000; // 15秒检查一次
const CHECK_TIMEOUT_MS = 3000;

// 初始化定时器
let checkInterval: NodeJS.Timeout | null = null;

function startCheckInterval() {
    if (checkInterval) return;
    checkInterval = setInterval(async () => {
        for (const [userId, status] of statusCache.entries()) {
            // 如果距离上次检查超过间隔，重新检查
            if (Date.now() - status.lastChecked > CHECK_INTERVAL_MS) {
                try {
                    const client = getAria2Client(userId);
                    await checkConnection(userId, client);
                } catch (e) {
                    // ignore
                }
            }
        }
    }, CHECK_INTERVAL_MS);
}

/**
 * 检查aria2连接状态
 */
async function checkConnection(userId: number, client: Aria2Client): Promise<ConnectionStatus> {
    const existing = statusCache.get(userId);
    
    // 如果3秒内刚检查过，直接返回缓存
    if (existing && Date.now() - existing.lastChecked < 3000) {
        return existing;
    }

    try {
        const version = await client.getVersion();
        const status: ConnectionStatus = {
            connected: true,
            version: version.version,
            features: version.enabledFeatures,
            lastChecked: Date.now()
        };
        statusCache.set(userId, status);
        return status;
    } catch (error: any) {
        const status: ConnectionStatus = {
            connected: false,
            lastChecked: Date.now(),
            error: error.message
        };
        statusCache.set(userId, status);
        return status;
    }
}

/**
 * 获取当前连接状态，不强制刷新
 */
export function getConnectionStatus(userId: number): ConnectionStatus {
    return statusCache.get(userId) || {
        connected: false,
        lastChecked: 0
    };
}

/**
 * 检查连接状态，可选强制刷新
 */
export async function getConnectionStatusAsync(userId: number, forceRefresh = false): Promise<ConnectionStatus> {
    const existing = statusCache.get(userId);
    
    if (!forceRefresh && existing && Date.now() - existing.lastChecked < 3000) {
        return existing;
    }
    
    try {
        const client = getAria2Client(userId);
        return await checkConnection(userId, client);
    } catch (error: any) {
        return {
            connected: false,
            lastChecked: Date.now(),
            error: error.message
        };
    }
}

/**
 * 判断是否已连接aria2
 */
export function isConnected(userId: number): boolean {
    const status = statusCache.get(userId);
    return status?.connected ?? false;
}

/**
 * 标记需要重新检查连接
 */
export function markNeedRecheck(userId: number) {
    statusCache.delete(userId);
}

/**
 * 清除用户连接状态
 */
export function clearConnectionStatus(userId: number) {
    statusCache.delete(userId);
}

// 启动定期检查
startCheckInterval();