import path from "path";
import fs from "fs";
import CryptoJS from "crypto-js";

const dataDir = process.env.DATA_DIR ?? "./data";

// 获取加密密钥，使用 JWT_SECRET 或默认值
const ENCRYPTION_KEY = process.env.JWT_SECRET ?? "your-secret-key-change-in-production";

if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

interface UserData {
    id: number;
    username: string;
    password_hash: string;
    password_encrypted?: string;  // AES 加密后的密码
    updated_at: number;
    configs: Record<string, {
        value: string;
        updated_at: number;
    }>;
}

interface StoreData {
    users: UserData[];
    nextUserId: number;
}

const storePath = path.join(dataDir, "store.json");

let store: StoreData = {
    users: [],
    nextUserId: 1,
};

function loadStore(): void {
    if (fs.existsSync(storePath)) {
        try {
            const data = fs.readFileSync(storePath, "utf8");
            store = JSON.parse(data);
        } catch (error) {
            console.warn("Failed to load store, using empty store:", error);
        }
    }
}

function saveStore(): void {
    fs.writeFileSync(storePath, JSON.stringify(store, null, 2));
}

// 加密函数
function encryptPassword(password: string): string {
    return CryptoJS.AES.encrypt(password, ENCRYPTION_KEY).toString();
}

// 解密函数
function decryptPassword(encrypted: string): string {
    const bytes = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
}

loadStore();

export interface RunResult {
    changes: number;
    lastID: number;
}

export function run(sql: string, params: unknown[] = []): RunResult {
    throw new Error("SQL queries are not supported in file-based store");
}

export function get<T = unknown>(
    sql: string,
    params: unknown[] = []
): T | undefined {
    throw new Error("SQL queries are not supported in file-based store");
}

export function all<T = unknown>(
    sql: string,
    params: unknown[] = []
): T[] {
    throw new Error("SQL queries are not supported in file-based store");
}

export function initDb(): void {
    // No-op for file-based store
}

export function createUser(username: string, passwordHash: string, passwordPlain?: string): UserData {
    const now = Date.now();
    const user: UserData = {
        id: store.nextUserId++,
        username,
        password_hash: passwordHash,
        updated_at: now,
        configs: {},
    };
    // 如果提供了明文密码，则加密存储
    if (passwordPlain) {
        user.password_encrypted = encryptPassword(passwordPlain);
    }
    store.users.push(user);
    saveStore();
    return user;
}

// 解密获取密码
export function getUserPassword(user: UserData): string | null {
    if (user.password_encrypted) {
        try {
            return decryptPassword(user.password_encrypted);
        } catch {
            return null;
        }
    }
    return null;
}

export function getUserById(id: number): UserData | undefined {
    return store.users.find(u => u.id === id);
}

export function getUserByUsername(username: string): UserData | undefined {
    return store.users.find(u => u.username === username);
}

export function updateUserPassword(userId: number, passwordHash: string, passwordPlain?: string): boolean {
    const user = store.users.find(u => u.id === userId);
    if (!user) return false;
    user.password_hash = passwordHash;
    if (passwordPlain) {
        user.password_encrypted = encryptPassword(passwordPlain);
    }
    user.updated_at = Date.now();
    saveStore();
    return true;
}

export function deleteUser(userId: number): boolean {
    const index = store.users.findIndex(u => u.id === userId);
    if (index === -1) return false;
    store.users.splice(index, 1);
    saveStore();
    return true;
}

export function getAllUsers(): UserData[] {
    return [...store.users];
}

export function setUserConfig(userId: number, key: string, value: string): {
    user_id: number;
    key: string;
    value: string;
    updated_at: number;
} {
    const now = Date.now();
    const user = store.users.find(u => u.id === userId);
    if (!user) {
        throw new Error("User not found");
    }
    user.configs[key] = {
        value,
        updated_at: now,
    };
    user.updated_at = now;
    saveStore();
    return {
        user_id: userId,
        key,
        value,
        updated_at: user.configs[key].updated_at,
    };
}

export function setUserConfigs(userId: number, configs: { key: string; value: string }[]): {
    user_id: number;
    configs: { key: string; value: string; updated_at: number }[];
} {
    const now = Date.now();
    const user = store.users.find(u => u.id === userId);
    if (!user) {
        throw new Error("User not found");
    }
    const updatedConfigs: { key: string; value: string; updated_at: number }[] = [];
    for (const config of configs) {
        user.configs[config.key] = {
            value: config.value,
            updated_at: now,
        };
        updatedConfigs.push({
            key: config.key,
            value: config.value,
            updated_at: now,
        });
    }
    user.updated_at = now;
    saveStore();
    return {
        user_id: userId,
        configs: updatedConfigs,
    };
}

export function getUserConfig(userId: number, key: string): {
    user_id: number;
    key: string;
    value: string;
    updated_at: number;
} | undefined {
    const user = store.users.find(u => u.id === userId);
    if (!user || !user.configs[key]) return undefined;
    return {
        user_id: userId,
        key,
        value: user.configs[key].value,
        updated_at: user.configs[key].updated_at,
    };
}

export function getAllUserConfigs(userId: number): {
    user_id: number;
    key: string;
    value: string;
    updated_at: number;
}[] {
    const user = store.users.find(u => u.id === userId);
    if (!user) return [];
    return Object.entries(user.configs).map(([key, config]) => ({
        user_id: userId,
        key,
        value: config.value,
        updated_at: config.updated_at,
    }));
}

export function deleteUserConfig(userId: number, key: string): boolean {
    const user = store.users.find(u => u.id === userId);
    if (!user || !user.configs[key]) return false;
    delete user.configs[key];
    user.updated_at = Date.now();
    saveStore();
    return true;
}

export function deleteAllUserConfigs(userId: number): number {
    const user = store.users.find(u => u.id === userId);
    if (!user) return 0;
    const count = Object.keys(user.configs).length;
    user.configs = {};
    user.updated_at = Date.now();
    saveStore();
    return count;
}