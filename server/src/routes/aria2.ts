import type { FastifyInstance, FastifyRequest, FastifyReply, FastifyPluginAsync } from "fastify";
import { getAria2Client } from "../aria2Manager.js";
import { authPreHandler, handleError } from "./auth.js";
import { getConnectionStatusAsync, markNeedRecheck, isConnected } from "../aria2Connection.js";
import { userService } from "../userService.js";
import * as fs from 'fs/promises';
import * as path from 'path';
import os from 'os';

const aria2Routes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
    // Helper function to get aria2 client for current user
    function getClient(request: FastifyRequest) {
        const userId = (request as any).user.id;
        return getAria2Client(userId);
    }

    function getUserId(request: FastifyRequest): number {
        return (request as any).user.id;
    }

    // 连接状态健康检查接口
    fastify.get("/connection-status", { preHandler: authPreHandler }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = getUserId(request);
            const status = await getConnectionStatusAsync(userId, true);
            reply.send({
                success: true,
                connected: status.connected,
                version: status.version,
                features: status.features,
                error: status.error
            });
        } catch (error) {
            reply.send({
                success: true,
                connected: false,
                error: (error as Error).message
            });
        }
    });

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

    // Helper function to get available disk space
    async function getDiskSpace(userId: number): Promise<{ total: number; free: number; available: number; used: number; path: string }> {
        let targetPath: string;

        // 尝试获取用户的默认下载路径
        const downloadPathConfig = userService.getUserConfig(userId, 'downloadPath');
        const savePathsConfig = userService.getUserConfig(userId, 'savePaths');
        
        let defaultPath = '';
        if (downloadPathConfig && downloadPathConfig.value) {
            defaultPath = downloadPathConfig.value;
        } else if (savePathsConfig && savePathsConfig.value) {
            try {
                const paths = JSON.parse(savePathsConfig.value);
                const defaultSavePath = paths.find((p: any) => p.isDefault);
                if (defaultSavePath && defaultSavePath.path) {
                    defaultPath = defaultSavePath.path;
                }
            } catch {
                // 解析失败，忽略
            }
        }

        if (defaultPath && defaultPath.trim()) {
            targetPath = defaultPath.trim();
        } else {
            // 没有配置默认路径，根据操作系统选择
            if (os.platform() === 'win32') {
                // Windows: 获取当前脚本运行所在磁盘
                const cwd = process.cwd();
                targetPath = cwd.substring(0, 3); // 例如 "C:\"
            } else {
                // Linux/Unix: 根目录
                targetPath = '/';
            }
        }

        // 检查路径是否存在
        const exists = await fs.access(targetPath).then(() => true).catch(() => false);
        if (!exists) {
            // 如果路径不存在，回退到默认路径
            if (os.platform() === 'win32') {
                targetPath = process.cwd().substring(0, 3);
            } else {
                targetPath = '/';
            }
        }

        try {
            // 获取磁盘统计信息
            const statfs = await fs.statfs(targetPath);
            
            // 计算可用空间（字节）
            const availableSpace = statfs.bavail * statfs.bsize;
            const totalSpace = statfs.blocks * statfs.bsize;
            const usedSpace = totalSpace - availableSpace;

            return {
                path: targetPath,
                total: totalSpace,
                free: availableSpace,
                available: availableSpace,
                used: usedSpace,
            };
        } catch (error) {
            // 获取失败返回0
            return {
                path: targetPath,
                total: 0,
                free: 0,
                available: 0,
                used: 0,
            };
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

    // 封装空数据返回
    function sendEmptyList(reply: FastifyReply) {
        reply.send({ success: true, list: [] });
    }

    // 处理错误并标记需要重新检查连接
    function handleAria2Error(userId: number, error: any, reply: FastifyReply) {
        // 如果是连接错误，标记需要重新检查
        if (error && (error.code === 'ECONNREFUSED' || error.code === 'ECONNRESET' || error.status === 0 || error.name === 'Aria2HttpError')) {
            markNeedRecheck(userId);
            sendEmptyList(reply);
            return;
        }
        sendEmptyList(reply);
    }

    // 获取活跃任务
    fastify.get("/active", { preHandler: authPreHandler }, async (request: FastifyRequest, reply: FastifyReply) => {
        const userId = getUserId(request);
        try {
            if (!isConnected(userId)) {
                sendEmptyList(reply);
                return;
            }
            const aria2 = getClient(request);
            const list = await aria2.tellActive();
            reply.send({ success: true, list });
        } catch (error) {
            handleAria2Error(userId, error, reply);
        }
    });

    // 获取等待任务
    fastify.get("/waiting", { preHandler: authPreHandler }, async (request: FastifyRequest, reply: FastifyReply) => {
        const userId = getUserId(request);
        try {
            if (!isConnected(userId)) {
                sendEmptyList(reply);
                return;
            }
            const query = request.query as { offset?: string | number; num?: string | number };
            const offset = Number(query.offset ?? 0);
            const num = Number(query.num ?? 20);

            const aria2 = getClient(request);
            const list = await aria2.tellWaiting(offset, num);
            reply.send({ success: true, list });
        } catch (error) {
            handleAria2Error(userId, error, reply);
        }
    });

    // 获取已停止任务
    fastify.get("/stopped", { preHandler: authPreHandler }, async (request: FastifyRequest, reply: FastifyReply) => {
        const userId = getUserId(request);
        try {
            if (!isConnected(userId)) {
                sendEmptyList(reply);
                return;
            }
            const query = request.query as { offset?: string | number; num?: string | number };
            const offset = Number(query.offset ?? 0);
            const num = Number(query.num ?? 20);

            const aria2 = getClient(request);
            const list = await aria2.tellStopped(offset, num);
            reply.send({ success: true, list });
        } catch (error) {
            handleAria2Error(userId, error, reply);
        }
    });

    // 一次性获取所有列表（active + waiting + stopped），减少网络请求次数
    fastify.get("/all-lists", { preHandler: authPreHandler }, async (request: FastifyRequest, reply: FastifyReply) => {
        const userId = getUserId(request);
        try {
            if (!isConnected(userId)) {
                reply.send({
                    success: true,
                    active: [],
                    waiting: [],
                    stopped: []
                });
                return;
            }
            const query = request.query as { offset?: string | number; num?: string | number };
            const num = Number(query.num ?? 1000); // 默认获取足够多的任务

            const aria2 = getClient(request);
            // 并行获取三个列表，减少等待时间
            const [activeList, waitingList, stoppedList] = await Promise.all([
                aria2.tellActive(),
                aria2.tellWaiting(0, num),
                aria2.tellStopped(0, num)
            ]);

            reply.send({
                success: true,
                active: activeList,
                waiting: waitingList,
                stopped: stoppedList
            });
        } catch (error) {
            handleAria2Error(userId, error, reply);
            reply.send({
                success: true,
                active: [],
                waiting: [],
                stopped: []
            });
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

    // 仪表盘综合接口：连接状态 + 全局速度统计 + 磁盘可用空间
    fastify.get("/dashboard", { preHandler: authPreHandler }, async (request: FastifyRequest, reply: FastifyReply) => {
        const userId = getUserId(request);
        
        try {
            // 并行获取连接状态和磁盘空间（磁盘空间不依赖aria2连接）
            const [connectionStatus, diskSpace] = await Promise.all([
                getConnectionStatusAsync(userId, true).catch((err) => ({
                    connected: false,
                    version: undefined,
                    features: undefined,
                    error: err.message
                })),
                getDiskSpace(userId)
            ]);

            // 初始化全局统计默认值
            let globalStat: any = {
                downloadSpeed: '0',
                uploadSpeed: '0',
                numActive: '0',
                numWaiting: '0',
                numStopped: '0',
                numStoppedTotal: '0'
            };

            // 如果已连接aria2，获取全局统计
            if (connectionStatus.connected) {
                try {
                    const aria2 = getClient(request);
                    globalStat = await aria2.getGlobalStat();
                } catch (err) {
                    // 获取失败标记连接断开
                    connectionStatus.connected = false;
                    connectionStatus.error = (err as Error).message;
                    markNeedRecheck(userId);
                }
            }

            reply.send({
                success: true,
                connected: connectionStatus.connected,
                version: connectionStatus.version,
                error: connectionStatus.error,
                // 速度统计（从getGlobalStat解析）
                downloadSpeed: parseInt(globalStat.downloadSpeed || '0', 10),
                uploadSpeed: parseInt(globalStat.uploadSpeed || '0', 10),
                numActive: parseInt(globalStat.numActive || '0', 10),
                numWaiting: parseInt(globalStat.numWaiting || '0', 10),
                numStopped: parseInt(globalStat.numStopped || '0', 10),
                // 磁盘空间
                diskSpace
            });
        } catch (error) {
            reply.send({
                success: true,
                connected: false,
                downloadSpeed: 0,
                uploadSpeed: 0,
                numActive: 0,
                numWaiting: 0,
                numStopped: 0,
                diskSpace: {
                    total: 0,
                    free: 0,
                    available: 0,
                    used: 0,
                    path: ''
                },
                error: (error as Error).message
            });
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