import type { Request, Response, NextFunction } from "express"
import jwt, { type JwtPayload } from 'jsonwebtoken'
import { User } from "../models/index.js";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const ACCESS_TOKEN_EXP = process.env.ACCESS_TOKEN_EXP;
const REFRESH_TOKEN_EXP = process.env.REFRESH_TOKEN_EXP;

if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET || !ACCESS_TOKEN_EXP || !REFRESH_TOKEN_EXP) {
    throw new Error("Must Pass Token Secrets")
}

export async function auth(req: Request, resp: Response, next: NextFunction) {
    try {
        let ACCESS_TOKEN = req.cookies.ACCESS_TOKEN || req.headers.authorization;

        if (!ACCESS_TOKEN) {
            resp.status(401).json({ message: "Unauthorized Access: Token Not Found" });
            return;
        }

        if (!ACCESS_TOKEN_SECRET) {
            resp.status(500).json({ message: "Internal Server Error: Secrets Not Found" });
            return;
        }

        if (ACCESS_TOKEN.startsWith("Bearer ")) {
            ACCESS_TOKEN = ACCESS_TOKEN.substring(7);
        }

        let payload: string | JwtPayload;

        try {
            payload = jwt.verify(ACCESS_TOKEN, ACCESS_TOKEN_SECRET);
        } catch {
            resp.status(401).json({ message: "Unauthorized Access: Invalid or Expired Token" });
            return;
        }

        if (!payload || typeof payload === 'string' || !payload._id) {
            resp.status(401).json({ message: "Error in decoding token" });
            return;
        }

        const user = await User.findById(payload._id);

        if (!user) {
            resp.status(404).json({ message: "User not found" });
            return;
        }

        req.user = user as any;

        next();
    } catch {
        resp.status(401).json({ message: "Unauthorized Access" });
        return;
    }
}

export async function optionalAuth(req: Request, resp: Response, next: NextFunction) {
    try {
        let ACCESS_TOKEN = req.cookies.ACCESS_TOKEN || req.headers.authorization;

        if (!ACCESS_TOKEN || !ACCESS_TOKEN_SECRET) {
            return next();
        }

        if (ACCESS_TOKEN.startsWith("Bearer ")) {
            ACCESS_TOKEN = ACCESS_TOKEN.substring(7);
        }

        try {
            const payload = jwt.verify(ACCESS_TOKEN, ACCESS_TOKEN_SECRET) as JwtPayload;
            if (payload && typeof payload !== 'string' && payload._id) {
                const user = await User.findById(payload._id);
                if (user) {
                    req.user = user as any;
                }
            }
        } catch {
            // Ignore error for optional auth
        }

        next();
    } catch {
        next();
    }
}
