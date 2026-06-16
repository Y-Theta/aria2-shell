// userService.ts
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { run, get, all } from "./db";
import { User, UserConfig, UserRow } from "./types/user";

const SALT_ROUNDS = 10;
const JWT_SECRET: string =
    process.env.JWT_SECRET ?? "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "7d";

export class UserService {
    // 创建用户
    createUser(username: string, password: string): User {
        const passwordHash = bcrypt.hashSync(password, SALT_ROUNDS);
        const now = Date.now();

        const result = run(
            "INSERT INTO users (username, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?)",
            [username, passwordHash, now, now]
        );

        return {
            id: result.lastID,
            username,
            created_at: now,
            updated_at: now,
        };
    }

    // 验证用户
    validateUser(username: string, password: string): User | null {
        const row = get<UserRow>(
            "SELECT id, username, password_hash, created_at, updated_at FROM users WHERE username = ?",
            [username]
        );

        if (!row) {
            return null;
        }

        const isValid = bcrypt.compareSync(password, row.password_hash);

        if (!isValid) {
            return null;
        }

        return {
            id: row.id,
            username: row.username,
            created_at: row.created_at,
            updated_at: row.updated_at,
        };
    }

    // 生成 JWT token
    generateToken(user: User): string {
        const payload = {
            id: user.id,
            username: user.username,
        };

        return jwt.sign(payload, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN,
        } as jwt.SignOptions);
    }

    // 验证 JWT token
    verifyToken(token: string): { id: number; username: string } | null {
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as {
                id: number;
                username: string;
            };

            return {
                id: decoded.id,
                username: decoded.username,
            };
        } catch {
            return null;
        }
    }

    // 获取用户，通过 ID
    getUserById(id: number): User | null {
        const row = get<User>(
            "SELECT id, username, created_at, updated_at FROM users WHERE id = ?",
            [id]
        );

        return row ?? null;
    }

    // 获取用户，通过用户名
    getUserByUsername(username: string): User | null {
        const row = get<User>(
            "SELECT id, username, created_at, updated_at FROM users WHERE username = ?",
            [username]
        );

        return row ?? null;
    }

    // 更新密码
    updatePassword(userId: number, newPassword: string): boolean {
        const passwordHash = bcrypt.hashSync(newPassword, SALT_ROUNDS);
        const now = Date.now();

        const result = run(
            "UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?",
            [passwordHash, now, userId]
        );

        return result.changes > 0;
    }

    // 删除用户
    deleteUser(userId: number): boolean {
        const result = run("DELETE FROM users WHERE id = ?", [userId]);

        return result.changes > 0;
    }

    // 获取所有用户
    getAllUsers(): User[] {
        return all<User>(
            "SELECT id, username, created_at, updated_at FROM users"
        );
    }

    // 设置用户配置
    setUserConfig(userId: number, key: string, value: string): UserConfig {
        const now = Date.now();

        run(
            `
            INSERT INTO user_configs 
                (user_id, key, value, created_at, updated_at)
            VALUES 
                (?, ?, ?, ?, ?)
            ON CONFLICT(user_id, key) DO UPDATE SET
                value = excluded.value,
                updated_at = excluded.updated_at
            `,
            [userId, key, value, now, now]
        );

        const row = get<UserConfig>(
            "SELECT id, user_id, key, value, created_at, updated_at FROM user_configs WHERE user_id = ? AND key = ?",
            [userId, key]
        );

        if (!row) {
            throw new Error("Failed to set user config");
        }

        return row;
    }

    // 获取用户配置
    getUserConfig(userId: number, key: string): UserConfig | null {
        const row = get<UserConfig>(
            "SELECT id, user_id, key, value, created_at, updated_at FROM user_configs WHERE user_id = ? AND key = ?",
            [userId, key]
        );

        return row ?? null;
    }

    // 获取用户所有配置
    getAllUserConfigs(userId: number): UserConfig[] {
        return all<UserConfig>(
            "SELECT id, user_id, key, value, created_at, updated_at FROM user_configs WHERE user_id = ?",
            [userId]
        );
    }

    // 删除用户配置
    deleteUserConfig(userId: number, key: string): boolean {
        const result = run(
            "DELETE FROM user_configs WHERE user_id = ? AND key = ?",
            [userId, key]
        );

        return result.changes > 0;
    }

    // 删除用户所有配置
    deleteAllUserConfigs(userId: number): number {
        const result = run(
            "DELETE FROM user_configs WHERE user_id = ?",
            [userId]
        );

        return result.changes;
    }
}

export const userService = new UserService();