import type { FastifyInstance, FastifyRequest, FastifyReply, FastifyPluginAsync } from "fastify";
import fs from "fs/promises";
import path from "path";
import { authPreHandler, handleError } from "./auth.js";

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
};

export { filesystemRoutes };