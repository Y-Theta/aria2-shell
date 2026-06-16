// db.ts
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dbDir = process.env.DB_DIR ?? "./data";

if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, "aria2-api.db");

const db = new Database(dbPath);

// 推荐开启 WAL，提高并发读性能
db.pragma("journal_mode = WAL");

// 开启外键约束
db.pragma("foreign_keys = ON");

export interface RunResult {
    changes: number;
    lastID: number;
}

function toNumberId(id: number | bigint): number {
    return typeof id === "bigint" ? Number(id) : id;
}

export function run(sql: string, params: unknown[] = []): RunResult {
    const result = db.prepare(sql).run(...params);

    return {
        changes: result.changes,
        lastID: toNumberId(result.lastInsertRowid),
    };
}

export function get<T = unknown>(
    sql: string,
    params: unknown[] = []
): T | undefined {
    return db.prepare(sql).get(...params) as T | undefined;
}

export function all<T = unknown>(
    sql: string,
    params: unknown[] = []
): T[] {
    return db.prepare(sql).all(...params) as T[];
}

export function initDb(): void {
    run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL
        )
    `);

    run(`
        CREATE TABLE IF NOT EXISTS user_configs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            key TEXT NOT NULL,
            value TEXT NOT NULL,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(user_id, key)
        )
    `);

    run(`
        CREATE INDEX IF NOT EXISTS idx_user_configs_user_id 
        ON user_configs(user_id)
    `);
}

export default db;