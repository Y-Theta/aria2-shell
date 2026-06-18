import type { FastifyInstance, FastifyRequest, FastifyReply, FastifyPluginAsync } from "fastify";
import { userService } from "../userService.js";
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

            reply.send({
                success: true,
                config: {
                    key: config.key,
                    value: config.value,
                    created_at: config.created_at,
                    updated_at: config.updated_at,
                },
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
                    created_at: config.created_at,
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
                    created_at: c.created_at,
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