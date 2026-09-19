import express from "express"
import type { Request, Response } from "express"
import cors from "cors"
import { authRouter } from "./routes/index.js";
import cookieParser from 'cookie-parser';

const port = process.env.PORT;

export const server = express()

server.use(cors())
server.use(express.json())
server.use(cookieParser())
server.use(express.urlencoded({ extended: true }))

server.use('/api/v1/auth', authRouter)

server.get('/', async function (req: Request, resp: Response) {
    resp.send({ message: 'ok' })
})
