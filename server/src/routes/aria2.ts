import type { FastifyInstance, FastifyRequest, FastifyReply, FastifyPluginAsync } from "fastify";
import { getAria2Client } from "../aria2Manager.js";
import { authPreHandler, handleError } from "./auth.js";

const aria2Routes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
    // Helper function to get aria2 client for current user
    function getClient(request: FastifyRequest) {
        const userId = (request as any).user.id;
        return getAria2Client(userId);
    }

    // 直接调用aria2 RPC方法
    fastify.post("/call", { preHandler: authPreHandler }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { method, params } = request.body as {
                method?: string;
                params?: unknown[];
            };

            if (!method || typeof method !== "string") {
                reply.code(400).send({
                    success: false,
                    message: "method is required",
                });
                return;
            }

            if (params !== undefined && !Array.isArray(params)) {
                reply.code(400).send({
                    success: false,
                    message: "params must be an array",
                });
                return;
            }

            const aria2 = getClient(request);
            const result = await aria2.callRaw(method, params ?? []);

            reply.send({
                success: true,
                result,
            });
        } catch (error) {
            handleError(reply, error);
        }
    });

    // 添加URI下载
    fastify.post("/add-uri", { preHandler: authPreHandler }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { uris, options, position } = request.body as {
                uris?: string[];
                options?: Record<string, string | number | boolean>;
                position?: number;
            };

            if (!Array.isArray(uris) || uris.length === 0) {
                reply.code(400).send({
                    success: false,
                    message: "uris must be a non-empty array",
                });
                return;
            }

            const aria2 = getClient(request);
            const gid = await aria2.addUri(uris, options, position);

            reply.send({
                success: true,
                gid,
            });
        } catch (error) {
            handleError(reply, error);
        }
    });

    // 获取任务状态
    fastify.get("/status/:gid", { preHandler: authPreHandler }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { gid } = request.params as { gid: string };

            const aria2 = getClient(request);
            const status = await aria2.tellStatus(gid);

            reply.send({
                success: true,
                status,
            });
        } catch (error) {
            handleError(reply, error);
        }
    });

    // 获取活跃任务
    fastify.get("/active", { preHandler: authPreHandler }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const aria2 = getClient(request);
            const list = await aria2.tellActive();

            reply.send({
                success: true,
                list,
            });
        } catch (error) {
            handleError(reply, error);
        }
    });

    // 获取等待任务
    fastify.get("/waiting", { preHandler: authPreHandler }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const query = request.query as { offset?: string | number; num?: string | number };
            const offset = Number(query.offset ?? 0);
            const num = Number(query.num ?? 20);

            const aria2 = getClient(request);
            const list = await aria2.tellWaiting(offset, num);

            reply.send({
                success: true,
                list,
            });
        } catch (error) {
            handleError(reply, error);
        }
    });

    // 获取已停止任务
    fastify.get("/stopped", { preHandler: authPreHandler }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const query = request.query as { offset?: string | number; num?: string | number };
            const offset = Number(query.offset ?? 0);
            const num = Number(query.num ?? 20);

            const aria2 = getClient(request);
            const list = await aria2.tellStopped(offset, num);

            reply.send({
                success: true,
                list,
            });
        } catch (error) {
            handleError(reply, error);
        }
    });

    // 暂停任务
    fastify.post("/pause/:gid", { preHandler: authPreHandler }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { gid } = request.params as { gid: string };

            const aria2 = getClient(request);
            const result = await aria2.pause(gid);

            reply.send({
                success: true,
                gid: result,
            });
        } catch (error) {
            handleError(reply, error);
        }
    });

    // 继续任务
    fastify.post("/unpause/:gid", { preHandler: authPreHandler }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { gid } = request.params as { gid: string };

            const aria2 = getClient(request);
            const result = await aria2.unpause(gid);

            reply.send({
                success: true,
                gid: result,
            });
        } catch (error) {
            handleError(reply, error);
        }
    });

    // 删除任务
    fastify.delete("/remove/:gid", { preHandler: authPreHandler }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { gid } = request.params as { gid: string };

            const aria2 = getClient(request);
            const result = await aria2.remove(gid);

            reply.send({
                success: true,
                gid: result,
            });
        } catch (error) {
            handleError(reply, error);
        }
    });

    // 强制删除任务
    fastify.delete("/force-remove/:gid", { preHandler: authPreHandler }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { gid } = request.params as { gid: string };

            const aria2 = getClient(request);
            const result = await aria2.forceRemove(gid);

            reply.send({
                success: true,
                gid: result,
            });
        } catch (error) {
            handleError(reply, error);
        }
    });

    // 获取全局状态
    fastify.get("/global-stat", { preHandler: authPreHandler }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const aria2 = getClient(request);
            const stat = await aria2.getGlobalStat();

            reply.send({
                success: true,
                stat,
            });
        } catch (error) {
            handleError(reply, error);
        }
    });

    // 获取aria2版本
    fastify.get("/version", { preHandler: authPreHandler }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const aria2 = getClient(request);
            const version = await aria2.getVersion();

            reply.send({
                success: true,
                version,
            });
        } catch (error) {
            handleError(reply, error);
        }
    });
};

export { aria2Routes };