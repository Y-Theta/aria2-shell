// userService.ts
import type { User as CommonUser, UserConfig as CommonUserConfig } from "../../../common/types";

export interface UserRow {
    id: number;
    username: string;
    password_hash: string;
    updated_at: number;
}

export type User = CommonUser;
export type UserConfig = CommonUserConfig;