import express from "express"
import cors from "cors"

const port = process.env.PORT;

export const server = express()

server.use(cors())
server.use(express.json())
server.use(express.urlencoded({ extended: true }))

server.get('/', async (req, resp, next) => {
    resp.send({ message: 'ok' })
})
