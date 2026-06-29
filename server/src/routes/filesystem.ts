import type { FastifyInstance, FastifyRequest, FastifyReply, FastifyPluginAsync } from "fastify";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { authPreHandler, handleError } from "./auth.js";
import { userService } from "../userService.js";

interface FileSystemItem {
  name: string;
  path: string;
  type: "file" | "directory";
  size?: number;
  children?: FileSystemItem[];
}

const filesystemRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  async function getDirectoryStructure(dirPath: string, recursive: boolean = true): Promise<FileSystemItem[]> {
    const items: FileSystemItem[] = [];
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const item: FileSystemItem = {
        name: entry.name,
        path: fullPath,
        type: entry.isDirectory() ? "directory" : "file",
      };

      if (!entry.isDirectory()) {
        const stats = await fs.stat(fullPath);
        item.size = stats.size;
      }

      if (entry.isDirectory() && recursive) {
        try {
          item.children = await getDirectoryStructure(fullPath, recursive);
        } catch (error) {
          item.children = [];
        }
      }

      items.push(item);
    }

    return items.sort((a, b) => {
      if (a.type === b.type) {
        return a.name.localeCompare(b.name);
      }
      return a.type === "directory" ? -1 : 1;
    });
  }

  fastify.get("/list", { preHandler: authPreHandler }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = request.query as { path?: string; recursive?: string };
      const targetPath = query.path || process.cwd();
      const recursive = query.recursive !== "false";

      const exists = await fs.access(targetPath).then(() => true).catch(() => false);
      if (!exists) {
        reply.code(404).send({
          success: false,
          message: "Path not found",
        });
        return;
      }

      const stats = await fs.stat(targetPath);
      if (!stats.isDirectory()) {
        reply.code(400).send({
          success: false,
          message: "Path is not a directory",
        });
        return;
      }

      const structure = await getDirectoryStructure(targetPath, recursive);

      reply.send({
        success: true,
        path: targetPath,
        items: structure,
      });
    } catch (error) {
      handleError(reply, error);
    }
  });

  fastify.post("/mkdir", { preHandler: authPreHandler }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = request.body as { path: string; recursive?: boolean };
      const targetPath = body.path;
      const recursive = body.recursive !== false;

      if (!targetPath) {
        reply.code(400).send({
          success: false,
          message: "Path is required",
        });
        return;
      }

      await fs.mkdir(targetPath, { recursive });

      reply.send({
        success: true,
        message: "Directory created successfully",
        path: targetPath,
      });
    } catch (error) {
      handleError(reply, error);
    }
  });

  // 获取磁盘可用空间
  fastify.get("/disk-space", { preHandler: authPreHandler }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const req = request as any;
      const query = request.query as { path?: string };
      
      let targetPath: string;

      if (query.path) {
        // 如果指定了路径，使用该路径
        targetPath = query.path;
      } else {
        // 尝试获取用户的默认下载路径
        const downloadPathConfig = userService.getUserConfig(req.user.id, 'downloadPath');
        const savePathsConfig = userService.getUserConfig(req.user.id, 'savePaths');
        
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

      // 获取磁盘统计信息
      // 使用原生fs.statfs
      const statfs = await fs.statfs(targetPath);
      
      // 计算可用空间（字节）
      // bavail: 可用块数（非特权用户）
      // bsize: 块大小（字节）
      const availableSpace = statfs.bavail * statfs.bsize;
      const totalSpace = statfs.blocks * statfs.bsize;
      const usedSpace = totalSpace - availableSpace;

      reply.send({
        success: true,
        path: targetPath,
        total: totalSpace,
        free: availableSpace,
        available: availableSpace,
        used: usedSpace,
      });
    } catch (error) {
      handleError(reply, error);
    }
  });
};

export { filesystemRoutes };