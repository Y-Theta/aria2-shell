import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as store from "./store.js";
import { User, UserConfig } from "./types/user.js";

const SALT_ROUNDS = 10;
const JWT_SECRET: string =
    process.env.JWT_SECRET ?? "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "7d";

export class UserService {
    createUser(username: string, password: string): User {
        const passwordHash = bcrypt.hashSync(password, SALT_ROUNDS);
        const userData = store.createUser(username, passwordHash, password);
        return {
            id: userData.id,
            username: userData.username,
            updated_at: userData.updated_at,
        };
    }
    
    // 获取用户密码（解密后）
    getUserPassword(userId: number): string | null {
        const userData = store.getUserById(userId);
        if (!userData) return null;
        return store.getUserPassword(userData);
    }

    validateUser(username: string, password: string): User | null {
        const userData = store.getUserByUsername(username);
        if (!userData) {
            return null;
        }

        const isValid = bcrypt.compareSync(password, userData.password_hash);
        if (!isValid) {
            return null;
        }

        return {
            id: userData.id,
            username: userData.username,
            updated_at: userData.updated_at,
        };
    }

    generateToken(user: User): string {
        const payload = {
            id: user.id,
            username: user.username,
        };

        return jwt.sign(payload, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN,
        } as jwt.SignOptions);
    }

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

    getUserById(id: number): User | null {
        const userData = store.getUserById(id);
        if (!userData) return null;
        return {
            id: userData.id,
            username: userData.username,
            updated_at: userData.updated_at,
        };
    }

    getUserByUsername(username: string): User | null {
        const userData = store.getUserByUsername(username);
        if (!userData) return null;
        return {
            id: userData.id,
            username: userData.username,
            updated_at: userData.updated_at,
        };
    }

    updatePassword(userId: number, newPassword: string): boolean {
        const passwordHash = bcrypt.hashSync(newPassword, SALT_ROUNDS);
        return store.updateUserPassword(userId, passwordHash);
    }

    deleteUser(userId: number): boolean {
        return store.deleteUser(userId);
    }

    getAllUsers(): User[] {
        return store.getAllUsers().map(userData => ({
            id: userData.id,
            username: userData.username,
            updated_at: userData.updated_at,
        }));
    }

    setUserConfig(userId: number, key: string, value: string): UserConfig {
        const configData = store.setUserConfig(userId, key, value);
        return {
            id: 0,
            user_id: configData.user_id,
            key: configData.key,
            value: configData.value,
            updated_at: configData.updated_at,
        };
    }

    getUserConfig(userId: number, key: string): UserConfig | null {
        const configData = store.getUserConfig(userId, key);
        if (!configData) return null;
        return {
            id: 0,
            user_id: configData.user_id,
            key: configData.key,
            value: configData.value,
            updated_at: configData.updated_at,
        };
    }

    getAllUserConfigs(userId: number): UserConfig[] {
        return store.getAllUserConfigs(userId).map(configData => ({
            id: 0,
            user_id: configData.user_id,
            key: configData.key,
            value: configData.value,
            updated_at: configData.updated_at,
        }));
    }

    deleteUserConfig(userId: number, key: string): boolean {
        return store.deleteUserConfig(userId, key);
    }

    deleteAllUserConfigs(userId: number): number {
        return store.deleteAllUserConfigs(userId);
    }
}

export const userService = new UserService();