import http from 'node:http'
import app from './index'
import { initSocket } from './sockets/'
import './config/db'
// import "./config/redis";

const PORT = process.env.PORT || 5000

const server = http.createServer(app)

initSocket(server)

server.listen(PORT, () => {
  console.log(`[Server] Started port ${PORT}`)
})
