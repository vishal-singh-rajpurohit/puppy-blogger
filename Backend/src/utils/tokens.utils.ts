import dotenv from "dotenv"
dotenv.config()

import jwt from 'jsonwebtoken'
import type mongoose from "mongoose";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_EXP = process.env.REFRESH_TOKEN_EXP;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const ACCESS_TOKEN_EXP = process.env.ACCESS_TOKEN_EXP;
const RESET_PASSWORD_EXP = process.env.RESET_PASSWORD_EXP;
const RESET_PASSWORD_SECRET = process.env.RESET_PASSWORD_SECRET;

if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET || !ACCESS_TOKEN_EXP || !REFRESH_TOKEN_EXP) {
    throw new Error("Must Pass Token Secrets")
}

export function decodeAccessToken(token: string): null | jwt.JwtPayload | string {
    try {
        if (!ACCESS_TOKEN_SECRET) {
            throw new Error("Must Pass Token Secrets")
        }
        const payload = jwt.verify(token, ACCESS_TOKEN_SECRET)
        return payload;
    } catch (error) {
        throw new Error("Error in decoding token")
    }
}

export function decodeRefreshToken(token: string): null | jwt.JwtPayload | string {
    try {
        if (!REFRESH_TOKEN_SECRET) {
            throw new Error("Must Pass Token Secrets")
        }
        const payload = jwt.verify(token, REFRESH_TOKEN_SECRET)
        return payload;
    } catch (error) {
        throw new Error("Error in decoding token")
    }
}

export function genrateResetToken(payload: { _id: mongoose.Types.ObjectId }): string {
    try {
        if (!RESET_PASSWORD_SECRET || !RESET_PASSWORD_EXP) {
            throw new Error("Must Pass Token Secrets")
        }
        const expiresIn = RESET_PASSWORD_EXP as NonNullable<jwt.SignOptions["expiresIn"]>;
        return jwt.sign({ _id: payload._id.toString() }, RESET_PASSWORD_SECRET, { expiresIn: expiresIn })

    } catch (error) {
        throw new Error("Error in creating token")
    }
}