// index.ts
import express, { Request, Response } from "express";
import { Aria2Client, Aria2RpcError, Aria2HttpError } from "./aria2Client";
import { userService } from "./userService";
import { authMiddleware, AuthRequest } from "./authMiddleware";
import { initDb } from "./db";

const app = express();

app.use(express.json({ limit: "10mb" }));

const aria2 = new Aria2Client({
    url: process.env.ARIA2_RPC_URL ?? "http://localhost:6800/jsonrpc",
    secret: process.env.ARIA2_SECRET,
    timeoutMs: 10_000,
});

function handleError(res: Response, error: unknown): void {
    if (error instanceof Aria2RpcError) {
        res.status(400).json({
            success: false,
            type: "ARIA2_RPC_ERROR",
            message: error.message,
            error,
        });
        return;
    }

    if (error instanceof Aria2HttpError) {
        res.status(502).json({
            success: false,
            type: "ARIA2_HTTP_ERROR",
            message: error.message,
            error,
        });
        return;
    }

    if (error instanceof Error) {
        res.status(500).json({
            success: false,
            type: "INTERNAL_ERROR",
            message: error.message,
        });
        return;
    }

    res.status(500).json({
        success: false,
        type: "UNKNOWN_ERROR",
        message: "Unknown error",
    });
}

// ============== 用户认证相关接口 ==============

// 用户注册
app.post("/api/auth/register", (req: Request, res: Response) => {
    try {
        const { username, password } = req.body as {
            username?: string;
            password?: string;
        };

        if (!username || typeof username !== "string" || username.trim().length === 0) {
            res.status(400).json({
                success: false,
                message: "Username is required",
            });
            return;
        }

        if (!password || typeof password !== "string" || password.length < 6) {
            res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters",
            });
            return;
        }

        const normalizedUsername = username.trim();

        // 检查用户名是否已存在
        const existingUser = userService.getUserByUsername(normalizedUsername);

        if (existingUser) {
            res.status(409).json({
                success: false,
                message: "Username already exists",
            });
            return;
        }

        const user = userService.createUser(normalizedUsername, password);
        const token = userService.generateToken(user);

        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                created_at: user.created_at,
            },
            token,
        });
    } catch (error) {
        handleError(res, error);
    }
});

// 用户登录
app.post("/api/auth/login", (req: Request, res: Response) => {
    try {
        const { username, password } = req.body as {
            username?: string;
            password?: string;
        };

        if (!username || typeof username !== "string") {
            res.status(400).json({
                success: false,
                message: "Username is required",
            });
            return;
        }

        if (!password || typeof password !== "string") {
            res.status(400).json({
                success: false,
                message: "Password is required",
            });
            return;
        }

        const user = userService.validateUser(username.trim(), password);

        if (!user) {
            res.status(401).json({
                success: false,
                message: "Invalid username or password",
            });
            return;
        }

        const token = userService.generateToken(user);

        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                created_at: user.created_at,
            },
            token,
        });
    } catch (error) {
        handleError(res, error);
    }
});

// 获取当前用户信息
app.get("/api/auth/me", authMiddleware, (req: AuthRequest, res: Response) => {
    try {
        const user = userService.getUserById(req.user!.id);

        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return;
        }

        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                created_at: user.created_at,
                updated_at: user.updated_at,
            },
        });
    } catch (error) {
        handleError(res, error);
    }
});

// 修改密码
app.post("/api/auth/change-password", authMiddleware, (req: AuthRequest, res: Response) => {
    try {
        const { oldPassword, newPassword } = req.body as {
            oldPassword?: string;
            newPassword?: string;
        };

        if (!oldPassword || typeof oldPassword !== "string") {
            res.status(400).json({
                success: false,
                message: "Old password is required",
            });
            return;
        }

        if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
            res.status(400).json({
                success: false,
                message: "New password must be at least 6 characters",
            });
            return;
        }

        const user = userService.getUserById(req.user!.id);

        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return;
        }

        // 验证旧密码
        const validUser = userService.validateUser(user.username, oldPassword);

        if (!validUser) {
            res.status(401).json({
                success: false,
                message: "Invalid old password",
            });
            return;
        }

        userService.updatePassword(req.user!.id, newPassword);

        res.json({
            success: true,
            message: "Password updated successfully",
        });
    } catch (error) {
        handleError(res, error);
    }
});

// ============== 用户配置相关接口 ==============

// 设置用户配置
app.post("/api/user/config", authMiddleware, (req: AuthRequest, res: Response) => {
    try {
        const { key, value } = req.body as {
            key?: string;
            value?: string;
        };

        if (!key || typeof key !== "string" || key.trim().length === 0) {
            res.status(400).json({
                success: false,
                message: "Config key is required",
            });
            return;
        }

        if (value === undefined || value === null || typeof value !== "string") {
            res.status(400).json({
                success: false,
                message: "Config value is required",
            });
            return;
        }

        const config = userService.setUserConfig(req.user!.id, key.trim(), value);

        res.json({
            success: true,
            config: {
                key: config.key,
                value: config.value,
                created_at: config.created_at,
                updated_at: config.updated_at,
            },
        });
    } catch (error) {
        handleError(res, error);
    }
});

// 获取用户配置
app.get("/api/user/config/:key", authMiddleware, (req: AuthRequest, res: Response) => {
    try {
        const { key } = req.params;

        const config = userService.getUserConfig(req.user!.id, key);

        if (!config) {
            res.status(404).json({
                success: false,
                message: "Config not found",
            });
            return;
        }

        res.json({
            success: true,
            config: {
                key: config.key,
                value: config.value,
                created_at: config.created_at,
                updated_at: config.updated_at,
            },
        });
    } catch (error) {
        handleError(res, error);
    }
});

// 获取用户所有配置
app.get("/api/user/configs", authMiddleware, (req: AuthRequest, res: Response) => {
    try {
        const configs = userService.getAllUserConfigs(req.user!.id);

        res.json({
            success: true,
            configs: configs.map((c) => ({
                key: c.key,
                value: c.value,
                created_at: c.created_at,
                updated_at: c.updated_at,
            })),
        });
    } catch (error) {
        handleError(res, error);
    }
});

// 删除用户配置
app.delete("/api/user/config/:key", authMiddleware, (req: AuthRequest, res: Response) => {
    try {
        const { key } = req.params;

        const deleted = userService.deleteUserConfig(req.user!.id, key);

        if (!deleted) {
            res.status(404).json({
                success: false,
                message: "Config not found",
            });
            return;
        }

        res.json({
            success: true,
            message: "Config deleted successfully",
        });
    } catch (error) {
        handleError(res, error);
    }
});

// ============== Aria2 相关接口，需要认证 ==============

app.post("/api/aria2/call", authMiddleware, async (req: Request, res: Response) => {
    try {
        const { method, params } = req.body as {
            method?: string;
            params?: unknown[];
        };

        if (!method || typeof method !== "string") {
            res.status(400).json({
                success: false,
                message: "method is required",
            });
            return;
        }

        if (params !== undefined && !Array.isArray(params)) {
            res.status(400).json({
                success: false,
                message: "params must be an array",
            });
            return;
        }

        const result = await aria2.callRaw(method, params ?? []);

        res.json({
            success: true,
            result,
        });
    } catch (error) {
        handleError(res, error);
    }
});

app.post("/api/aria2/add-uri", authMiddleware, async (req: Request, res: Response) => {
    try {
        const { uris, options, position } = req.body as {
            uris?: string[];
            options?: Record<string, string | number | boolean>;
            position?: number;
        };

        if (!Array.isArray(uris) || uris.length === 0) {
            res.status(400).json({
                success: false,
                message: "uris must be a non-empty array",
            });
            return;
        }

        const gid = await aria2.addUri(uris, options, position);

        res.json({
            success: true,
            gid,
        });
    } catch (error) {
        handleError(res, error);
    }
});

app.get("/api/aria2/status/:gid", authMiddleware, async (req: Request, res: Response) => {
    try {
        const { gid } = req.params;

        const status = await aria2.tellStatus(gid);

        res.json({
            success: true,
            status,
        });
    } catch (error) {
        handleError(res, error);
    }
});

app.get("/api/aria2/active", authMiddleware, async (_req: Request, res: Response) => {
    try {
        const list = await aria2.tellActive();

        res.json({
            success: true,
            list,
        });
    } catch (error) {
        handleError(res, error);
    }
});

app.get("/api/aria2/waiting", authMiddleware, async (req: Request, res: Response) => {
    try {
        const offset = Number(req.query.offset ?? 0);
        const num = Number(req.query.num ?? 20);

        const list = await aria2.tellWaiting(offset, num);

        res.json({
            success: true,
            list,
        });
    } catch (error) {
        handleError(res, error);
    }
});

app.get("/api/aria2/stopped", authMiddleware, async (req: Request, res: Response) => {
    try {
        const offset = Number(req.query.offset ?? 0);
        const num = Number(req.query.num ?? 20);

        const list = await aria2.tellStopped(offset, num);

        res.json({
            success: true,
            list,
        });
    } catch (error) {
        handleError(res, error);
    }
});

app.post("/api/aria2/pause/:gid", authMiddleware, async (req: Request, res: Response) => {
    try {
        const { gid } = req.params;

        const result = await aria2.pause(gid);

        res.json({
            success: true,
            gid: result,
        });
    } catch (error) {
        handleError(res, error);
    }
});

app.post("/api/aria2/unpause/:gid", authMiddleware, async (req: Request, res: Response) => {
    try {
        const { gid } = req.params;

        const result = await aria2.unpause(gid);

        res.json({
            success: true,
            gid: result,
        });
    } catch (error) {
        handleError(res, error);
    }
});

app.delete("/api/aria2/remove/:gid", authMiddleware, async (req: Request, res: Response) => {
    try {
        const { gid } = req.params;

        const result = await aria2.remove(gid);

        res.json({
            success: true,
            gid: result,
        });
    } catch (error) {
        handleError(res, error);
    }
});

app.delete("/api/aria2/force-remove/:gid", authMiddleware, async (req: Request, res: Response) => {
    try {
        const { gid } = req.params;

        const result = await aria2.forceRemove(gid);

        res.json({
            success: true,
            gid: result,
        });
    } catch (error) {
        handleError(res, error);
    }
});

app.get("/api/aria2/global-stat", authMiddleware, async (_req: Request, res: Response) => {
    try {
        const stat = await aria2.getGlobalStat();

        res.json({
            success: true,
            stat,
        });
    } catch (error) {
        handleError(res, error);
    }
});

app.get("/api/aria2/version", authMiddleware, async (_req: Request, res: Response) => {
    try {
        const version = await aria2.getVersion();

        res.json({
            success: true,
            version,
        });
    } catch (error) {
        handleError(res, error);
    }
});

const port = Number(process.env.PORT ?? 65002);

function start(): void {
    try {
        initDb();

        app.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

start();