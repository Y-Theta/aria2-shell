import type { FastifyInstance, FastifyRequest, FastifyReply, FastifyPluginAsync } from "fastify";
import { userService } from "../userService.js";
import { Aria2Client, Aria2RpcError, Aria2HttpError } from "../aria2Client.js";

// Auth middleware
async function authPreHandler(request: FastifyRequest, reply: FastifyReply) {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        reply.code(401).send({
            success: false,
            message: "Unauthorized: Missing or invalid token",
        });
        return;
    }

    const token = authHeader.substring(7);
    const decoded = userService.verifyToken(token);

    if (!decoded) {
        reply.code(401).send({
            success: false,
            message: "Unauthorized: Invalid or expired token",
        });
        return;
    }

    (request as any).user = decoded;
}

// Error handler
function handleError(reply: FastifyReply, error: unknown): void {
    if (error instanceof Aria2RpcError) {
        reply.code(400).send({
            success: false,
            type: "ARIA2_RPC_ERROR",
            message: error.message,
            error,
        });
        return;
    }

    if (error instanceof Aria2HttpError) {
        reply.code(502).send({
            success: false,
            type: "ARIA2_HTTP_ERROR",
            message: error.message,
            error,
        });
        return;
    }

    if (error instanceof Error) {
        reply.code(500).send({
            success: false,
            type: "INTERNAL_ERROR",
            message: error.message,
        });
        return;
    }

    reply.code(500).send({
        success: false,
        type: "UNKNOWN_ERROR",
        message: "Unknown error",
    });
}

const authRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
    // 用户注册 - 默认隐藏，可通过环境变量 ENABLE_REGISTER=true 开启
    const enableRegister = process.env.ENABLE_REGISTER === "true";
    if (enableRegister) {
        fastify.post("/register", async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { username, password } = request.body as {
                username?: string;
                password?: string;
            };

            if (!username || typeof username !== "string" || username.trim().length === 0) {
                reply.code(400).send({
                    success: false,
                    message: "Username is required",
                });
                return;
            }

            if (!password || typeof password !== "string" || password.length < 6) {
                reply.code(400).send({
                    success: false,
                    message: "Password must be at least 6 characters",
                });
                return;
            }

            const normalizedUsername = username.trim();
            const existingUser = userService.getUserByUsername(normalizedUsername);

            if (existingUser) {
                reply.code(409).send({
                    success: false,
                    message: "Username already exists",
                });
                return;
            }

            const user = userService.createUser(normalizedUsername, password);
            const token = userService.generateToken(user);

            reply.send({
                success: true,
                user: {
                    id: user.id,
                    username: user.username,
                    updated_at: user.updated_at,
                },
                token,
            });
        } catch (error) {
                handleError(reply, error);
            }
        });
    }

    // 用户登录
    fastify.post("/login", async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { username, password } = request.body as {
                username?: string;
                password?: string;
            };

            if (!username || typeof username !== "string") {
                reply.code(400).send({
                    success: false,
                    message: "Username is required",
                });
                return;
            }

            if (!password || typeof password !== "string") {
                reply.code(400).send({
                    success: false,
                    message: "Password is required",
                });
                return;
            }

            const user = userService.validateUser(username.trim(), password);

            if (!user) {
                reply.code(401).send({
                    success: false,
                    message: "Invalid username or password",
                });
                return;
            }

            const token = userService.generateToken(user);

            reply.send({
                success: true,
                user: {
                    id: user.id,
                    username: user.username,
                    updated_at: user.updated_at,
                },
                token,
            });
        } catch (error) {
            handleError(reply, error);
        }
    });

    // 获取当前用户信息
    fastify.get("/me", { preHandler: authPreHandler }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const req = request as any;
            const user = userService.getUserById(req.user.id);

            if (!user) {
                reply.code(404).send({
                    success: false,
                    message: "User not found",
                });
                return;
            }

            reply.send({
                success: true,
                user: {
                    id: user.id,
                    username: user.username,
                    updated_at: user.updated_at,
                },
            });
        } catch (error) {
            handleError(reply, error);
        }
    });

    // 修改密码
    fastify.post("/change-password", { preHandler: authPreHandler }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const req = request as any;
            const { oldPassword, newPassword } = request.body as {
                oldPassword?: string;
                newPassword?: string;
            };

            if (!oldPassword || typeof oldPassword !== "string") {
                reply.code(400).send({
                    success: false,
                    message: "Old password is required",
                });
                return;
            }

            if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
                reply.code(400).send({
                    success: false,
                    message: "New password must be at least 6 characters",
                });
                return;
            }

            const user = userService.getUserById(req.user.id);

            if (!user) {
                reply.code(404).send({
                    success: false,
                    message: "User not found",
                });
                return;
            }

            const validUser = userService.validateUser(user.username, oldPassword);

            if (!validUser) {
                reply.code(401).send({
                    success: false,
                    message: "Invalid old password",
                });
                return;
            }

            userService.updatePassword(req.user.id, newPassword);

            reply.send({
                success: true,
                message: "Password updated successfully",
            });
        } catch (error) {
            handleError(reply, error);
        }
    });
};

export { authRoutes, authPreHandler, handleError };