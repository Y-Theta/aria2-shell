// Fastify Server with Route Organization
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fastify, { FastifyInstance } from "fastify";
import fastifyCors from "@fastify/cors";
import { Aria2Client } from "./aria2Client.js";
import { initDb } from "./store.js";

// Import Routes
import { authRoutes } from "./routes/auth.js";
import { userRoutes } from "./routes/user.js";
import { aria2Routes } from "./routes/aria2.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
const result = dotenv.config({
  path: path.join(__dirname, "../../.env")
});

if (result.error) {
  console.warn("Warning: Could not load .env file, using defaults");
  console.warn("Error:", result.error.message);
} else {
  console.log("Loaded .env file successfully");
}

console.log("\nEnvironment variables:");
console.log("  PORT:", process.env.PORT);
console.log("  ARIA2_RPC_URL:", process.env.ARIA2_RPC_URL);
console.log("  ARIA2_SECRET:", process.env.ARIA2_SECRET ? "****" : "(not set)");
console.log("  NODE_ENV:", process.env.NODE_ENV);
console.log("  Working dir:", process.cwd());
console.log("  __dirname:", __dirname);

const app: FastifyInstance = fastify({
  logger: false,
  bodyLimit: 10 * 1024 * 1024 // 10mb
});

// Register CORS plugin
await app.register(fastifyCors);

const aria2 = new Aria2Client({
    url: process.env.ARIA2_RPC_URL ?? "http://localhost:6800/jsonrpc",
    secret: process.env.ARIA2_SECRET,
    timeoutMs: 10_000,
});

// Register Auth Routes
await app.register(authRoutes, { prefix: "/api/auth" });

// Register User Routes
await app.register(userRoutes, { prefix: "/api/user" });

// Register Aria2 Routes with aria2 client
await app.register(aria2Routes, { prefix: "/api/aria2", aria2 });

const port = Number(process.env.PORT ?? 65002);

async function start(): Promise<void> {
    try {
        initDb();

        await app.listen({ port, host: "0.0.0.0" });
        console.log(`Server running on http://localhost:${port}`);
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

start();