import path from "path";
import fs from "fs";

const dataDir = process.env.DATA_DIR ?? "./data";

if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

interface UserData {
    id: number;
    username: string;
    password_hash: string;
    created_at: number;
    updated_at: number;
    configs: Record<string, {
        value: string;
        created_at: number;
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

export function createUser(username: string, passwordHash: string): UserData {
    const now = Date.now();
    const user: UserData = {
        id: store.nextUserId++,
        username,
        password_hash: passwordHash,
        created_at: now,
        updated_at: now,
        configs: {},
    };
    store.users.push(user);
    saveStore();
    return user;
}

export function getUserById(id: number): UserData | undefined {
    return store.users.find(u => u.id === id);
}

export function getUserByUsername(username: string): UserData | undefined {
    return store.users.find(u => u.username === username);
}

export function updateUserPassword(userId: number, passwordHash: string): boolean {
    const user = store.users.find(u => u.id === userId);
    if (!user) return false;
    user.password_hash = passwordHash;
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
    created_at: number;
    updated_at: number;
} {
    const now = Date.now();
    const user = store.users.find(u => u.id === userId);
    if (!user) {
        throw new Error("User not found");
    }
    if (user.configs[key]) {
        user.configs[key].value = value;
        user.configs[key].updated_at = now;
    } else {
        user.configs[key] = {
            value,
            created_at: now,
            updated_at: now,
        };
    }
    user.updated_at = now;
    saveStore();
    return {
        user_id: userId,
        key,
        value,
        created_at: user.configs[key].created_at,
        updated_at: user.configs[key].updated_at,
    };
}

export function getUserConfig(userId: number, key: string): {
    user_id: number;
    key: string;
    value: string;
    created_at: number;
    updated_at: number;
} | undefined {
    const user = store.users.find(u => u.id === userId);
    if (!user || !user.configs[key]) return undefined;
    return {
        user_id: userId,
        key,
        value: user.configs[key].value,
        created_at: user.configs[key].created_at,
        updated_at: user.configs[key].updated_at,
    };
}

export function getAllUserConfigs(userId: number): {
    user_id: number;
    key: string;
    value: string;
    created_at: number;
    updated_at: number;
}[] {
    const user = store.users.find(u => u.id === userId);
    if (!user) return [];
    return Object.entries(user.configs).map(([key, config]) => ({
        user_id: userId,
        key,
        value: config.value,
        created_at: config.created_at,
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
