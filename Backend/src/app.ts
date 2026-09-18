import express from "express"
import type {Request, Response} from "express"
import cors from "cors"

const port = process.env.PORT;

export const server = express()

server.use(cors())
server.use(express.json())
server.use(express.urlencoded({ extended: true }))

async function hc(req: Request, resp: Response){
    resp.send({ message: 'ok' })
}

server.get('/', async (req, resp) => hc)
