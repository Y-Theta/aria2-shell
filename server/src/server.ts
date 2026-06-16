import express, { Request, Response } from "express";
import { Aria2Client , Aria2RpcError, Aria2HttpError} from "./aria2Client";

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

app.post("/api/aria2/call", async (req: Request, res: Response) => {
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

app.post("/api/aria2/add-uri", async (req: Request, res: Response) => {
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

app.get("/api/aria2/status/:gid", async (req: Request, res: Response) => {
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

app.get("/api/aria2/active", async (_req: Request, res: Response) => {
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

app.get("/api/aria2/waiting", async (req: Request, res: Response) => {
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

app.get("/api/aria2/stopped", async (req: Request, res: Response) => {
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

app.post("/api/aria2/pause/:gid", async (req: Request, res: Response) => {
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

app.post("/api/aria2/unpause/:gid", async (req: Request, res: Response) => {
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

app.delete("/api/aria2/remove/:gid", async (req: Request, res: Response) => {
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

app.delete("/api/aria2/force-remove/:gid", async (req: Request, res: Response) => {
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

app.get("/api/aria2/global-stat", async (_req: Request, res: Response) => {
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

app.get("/api/aria2/version", async (_req: Request, res: Response) => {
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

const port = Number(process.env.PORT ?? 3000);

app.listen(port, () => {
    console.log(`Aria2 API server is running on http://localhost:${port}`);
});