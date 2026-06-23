import type { FastifyInstance, FastifyRequest, FastifyReply, FastifyPluginAsync } from "fastify";
import { userService } from "../userService.js";
import { clearAria2ClientCache } from "../aria2Manager.js";
import { authPreHandler, handleError } from "./auth.js";

const userRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
    // 设置用户配置
    fastify.post("/config", { preHandler: authPreHandler }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const req = request as any;
            const { key, value } = request.body as {
                key?: string;
                value?: string;
            };

            if (!key || typeof key !== "string" || key.trim().length === 0) {
                reply.code(400).send({
                    success: false,
                    message: "Config key is required",
                });
                return;
            }

            if (value === undefined || value === null || typeof value !== "string") {
                reply.code(400).send({
                    success: false,
                    message: "Config value is required",
                });
                return;
            }

            const config = userService.setUserConfig(req.user.id, key.trim(), value);

            // 如果是 Aria2 相关配置，清除缓存
            if (key === "serverUrl" || key === "secret") {
                clearAria2ClientCache(req.user.id);
            }

            reply.send({
                success: true,
                config: {
                    key: config.key,
                    value: config.value,
                    updated_at: config.updated_at,
                },
            });
        } catch (error) {
            handleError(reply, error);
        }
    });

    // 批量设置用户配置
    fastify.post("/configs", { preHandler: authPreHandler }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const req = request as any;
            const { configs } = request.body as {
                configs?: Array<{ key: string; value: string }>;
            };

            if (!configs || !Array.isArray(configs) || configs.length === 0) {
                reply.code(400).send({
                    success: false,
                    message: "Configs array is required",
                });
                return;
            }

            for (const config of configs) {
                if (!config.key || typeof config.key !== "string" || config.key.trim().length === 0) {
                    reply.code(400).send({
                        success: false,
                        message: "Each config must have a valid key",
                    });
                    return;
                }
                if (config.value === undefined || config.value === null || typeof config.value !== "string") {
                    reply.code(400).send({
                        success: false,
                        message: "Each config must have a valid value",
                    });
                    return;
                }
            }

            const cleanedConfigs = configs.map(c => ({
                key: c.key.trim(),
                value: c.value,
            }));

            const result = userService.setUserConfigs(req.user.id, cleanedConfigs);

            // 如果是 Aria2 相关配置，清除缓存
            const hasAria2Config = cleanedConfigs.some(c => c.key === "serverUrl" || c.key === "secret");
            if (hasAria2Config) {
                clearAria2ClientCache(req.user.id);
            }

            reply.send({
                success: true,
                configs: result.configs.map(c => ({
                    key: c.key,
                    value: c.value,
                    updated_at: c.updated_at,
                })),
            });
        } catch (error) {
            handleError(reply, error);
        }
    });

    // 获取用户配置
    fastify.get("/config/:key", { preHandler: authPreHandler }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const req = request as any;
            const { key } = request.params as { key: string };

            const config = userService.getUserConfig(req.user.id, key);

            if (!config) {
                reply.code(404).send({
                    success: false,
                    message: "Config not found",
                });
                return;
            }

            reply.send({
                success: true,
                config: {
                    key: config.key,
                    value: config.value,
                    updated_at: config.updated_at,
                },
            });
        } catch (error) {
            handleError(reply, error);
        }
    });

    // 获取用户所有配置
    fastify.get("/configs", { preHandler: authPreHandler }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const req = request as any;
            const configs = userService.getAllUserConfigs(req.user.id);

            reply.send({
                success: true,
                configs: configs.map((c: any) => ({
                    key: c.key,
                    value: c.value,
                    updated_at: c.updated_at,
                })),
            });
        } catch (error) {
            handleError(reply, error);
        }
    });

    // 删除用户配置
    fastify.delete("/config/:key", { preHandler: authPreHandler }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const req = request as any;
            const { key } = request.params as { key: string };

            const deleted = userService.deleteUserConfig(req.user.id, key);

            if (!deleted) {
                reply.code(404).send({
                    success: false,
                    message: "Config not found",
                });
                return;
            }

            reply.send({
                success: true,
                message: "Config deleted successfully",
            });
        } catch (error) {
            handleError(reply, error);
        }
    });
};

export { userRoutes };