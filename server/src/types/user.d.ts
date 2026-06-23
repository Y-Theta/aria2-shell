// userService.ts
export interface UserRow {
    id: number;
    username: string;
    password_hash: string;
    updated_at: number;
}

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