import express from "express"
import type { Request, Response } from "express"
import cors from "cors"
import routes from "./routes/index.js";
import cookieParser from 'cookie-parser';
import { globalError } from "./middleware/global.middleware.js";

export const server = express()


const CORS_ORIGIN = process.env.CORS_URL || "http://localhost:3000";
const allowedOrigins = CORS_ORIGIN.includes(",")
    ? CORS_ORIGIN.split(",").map((s) => s.trim())
    : CORS_ORIGIN;

server.use(cors({
    origin: allowedOrigins,
    credentials: true
}))
server.use(express.json())
server.use(cookieParser())
server.use(express.urlencoded({ extended: true }))

server.use('/api/v1/auth', routes.authRouter)
server.use('/api/v1/blog', routes.blogRouter)

server.get('/', async function (req: Request, resp: Response) {
    resp.send({ message: 'ok' })
})

server.use(globalError)
