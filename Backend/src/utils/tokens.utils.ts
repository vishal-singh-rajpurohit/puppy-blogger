import dotenv from "dotenv"
dotenv.config()

import jwt from 'jsonwebtoken'
import { User } from '../models/index.js'

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const ACCESS_TOKEN_EXP = process.env.ACCESS_TOKEN_EXP;
const REFRESH_TOKEN_EXP = process.env.REFRESH_TOKEN_EXP;

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