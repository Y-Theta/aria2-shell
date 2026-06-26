import type { FastifyInstance, FastifyRequest, FastifyReply, FastifyPluginAsync } from "fastify";
import { getAria2Client } from "../aria2Manager.js";
import { authPreHandler, handleError } from "./auth.js";
import * as fs from 'fs/promises';
import * as path from 'path';

const aria2Routes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
    // Helper function to get aria2 client for current user
    function getClient(request: FastifyRequest) {
        const userId = (request as any).user.id;
        return getAria2Client(userId);
    }

    // Helper function to delete local files by paths
    async function deleteFilesByPaths(filePaths: string[], isTorrent: boolean = false) {
        for (const filePath of filePaths) {
            if (!filePath || !filePath.trim()) continue;
            
            try {
                await fs.unlink(filePath);
                
                // If it's a torrent, try to remove the directory if empty
                if (isTorrent) {
                    const dir = path.dirname(filePath);
                    try {
                        const dirFiles = await fs.readdir(dir);
                        if (dirFiles.length === 0) {
                            await fs.rmdir(dir);
                        }
                    } catch (dirErr) {
                        // Ignore directory removal errors
                    }
                }
            } catch (fileErr) {
                console.error(`Failed to delete file ${filePath}:`, fileErr);
            }
        }
    }

    // Helper function to get file paths and delete local files for a task
    async function deleteLocalFiles(aria2: any, gid: string) {
        try {
            const [status, taskFiles] = await Promise.all([
                aria2.tellStatus(gid).catch(() => null),
                aria2.getFiles(gid).catch(() => [])
            ]);
            
            const filePaths = (taskFiles || [])
                .filter((f: any) => f.path && f.path.trim())
                .map((f: any) => f.path);
            
            const isTorrent = !!(status && status.bittorrent);
            
            await deleteFilesByPaths(filePaths, isTorrent);
        } catch (err) {
            console.error(`Failed to delete files for task ${gid}:`, err);
        }
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
            const { deleteLocalFile } = request.query as { deleteLocalFile?: string };
            const shouldDeleteFile = deleteLocalFile === 'true';

            const aria2 = getClient(request);
            
            // 如果需要删除本地文件，先获取文件路径
            let filesToDelete: string[] = [];
            let isTorrent = false;
            if (shouldDeleteFile) {
                try {
                    const [status, taskFiles] = await Promise.all([
                        aria2.tellStatus(gid).catch(() => null),
                        aria2.getFiles(gid).catch(() => [] as any[])
                    ]);
                    filesToDelete = (taskFiles || [])
                        .filter((f: any) => f.path && f.path.trim())
                        .map((f: any) => f.path);
                    isTorrent = !!(status && status.bittorrent);
                } catch (e) {
                    console.warn(`Could not get files for ${gid} before remove:`, e);
                }
            }
            
            // 删除任务
            const result = await aria2.remove(gid);
            
            // 保存session
            aria2.saveSession().catch((err: Error) => {
                console.warn(`Failed to save session after remove ${gid}:`, err.message);
            });
            
            // 任务删除成功后异步删除本地文件
            if (shouldDeleteFile && filesToDelete.length > 0) {
                deleteFilesByPaths(filesToDelete, isTorrent).catch(err => {
                    console.error(`Failed to delete files for ${gid}:`, err);
                });
            }

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
            const { deleteLocalFile } = request.query as { deleteLocalFile?: string };
            const shouldDeleteFile = deleteLocalFile === 'true';

            const aria2 = getClient(request);
            
            // 如果需要删除本地文件，先获取文件路径
            let filesToDelete: string[] = [];
            let isTorrent = false;
            if (shouldDeleteFile) {
                try {
                    const [status, taskFiles] = await Promise.all([
                        aria2.tellStatus(gid).catch(() => null),
                        aria2.getFiles(gid).catch(() => [] as any[])
                    ]);
                    filesToDelete = (taskFiles || [])
                        .filter((f: any) => f.path && f.path.trim())
                        .map((f: any) => f.path);
                    isTorrent = !!(status && status.bittorrent);
                } catch (e) {
                    console.warn(`Could not get files for ${gid} before force remove:`, e);
                }
            }
            
            // 强制删除任务
            const result = await aria2.forceRemove(gid);
            
            // 保存session
            aria2.saveSession().catch((err: Error) => {
                console.warn(`Failed to save session after force remove ${gid}:`, err.message);
            });
            
            // 任务删除成功后异步删除本地文件
            if (shouldDeleteFile && filesToDelete.length > 0) {
                // 等待一小段时间让aria2释放文件锁
                setTimeout(() => {
                    deleteFilesByPaths(filesToDelete, isTorrent).catch(err => {
                        console.error(`Failed to delete files for ${gid}:`, err);
                    });
                }, 200);
            }

            reply.send({
                success: true,
                gid: result,
            });
        } catch (error) {
            handleError(reply, error);
        }
    });

    // 删除已完成/错误任务的下载结果
    fastify.delete("/remove-result/:gid", { preHandler: authPreHandler }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { gid } = request.params as { gid: string };
            const { deleteLocalFile } = request.query as { deleteLocalFile?: string };
            const shouldDeleteFile = deleteLocalFile === 'true';

            const aria2 = getClient(request);
            
            // 获取文件路径并删除文件
            if (shouldDeleteFile) {
                await deleteLocalFiles(aria2, gid);
            }
            
            // 删除下载记录
            const result = await aria2.removeDownloadResult(gid);
            
            // 保存session
            aria2.saveSession().catch((err: Error) => {
                console.warn(`Failed to save session after remove result ${gid}:`, err.message);
            });

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