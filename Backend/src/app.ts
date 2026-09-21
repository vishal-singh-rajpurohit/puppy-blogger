import express from "express"
import type { Request, Response } from "express"
import cors from "cors"
import routes from "./routes/index.js";
import cookieParser from 'cookie-parser';
import { globalError } from "./middleware/global.middleware.js";

export const server = express()


const CORS_ORIGIN = process.env.CORS_URL;
if (!CORS_ORIGIN) {
    throw new Error("CORS_ORIGIN not provided")
}
server.use(cors({
    origin: CORS_ORIGIN,
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
