// authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import { userService } from "./userService";

export interface AuthRequest extends Request {
    user?: {
        id: number;
        username: string;
    };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({
            success: false,
            message: "Unauthorized: Missing or invalid token",
        });
        return;
    }

    const token = authHeader.substring(7);
    const decoded = userService.verifyToken(token);

    if (!decoded) {
        res.status(401).json({
            success: false,
            message: "Unauthorized: Invalid or expired token",
        });
        return;
    }

    req.user = decoded;
    next();
}