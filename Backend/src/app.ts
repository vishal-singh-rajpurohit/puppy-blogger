import express from "express"
import type { Request, Response } from "express"
import cors from "cors"
import routes from "./routes/index.js";
import cookieParser from 'cookie-parser';

export const server = express()

server.use(cors())
server.use(express.json())
server.use(cookieParser())
server.use(express.urlencoded({ extended: true }))

server.use('/api/v1/auth', routes.authRouter)
server.use('/api/v1/blog', routes.blogRouter)

server.get('/', async function (req: Request, resp: Response) {
    resp.send({ message: 'ok' })
})
