import http from 'node:http'
import { connectDB } from './config/db'
import app from './index'
import { initSocket } from './sockets/'
import logger from './utils/logger'

const PORT = process.env.PORT || 5000

const server = http.createServer(app)

initSocket(server)

connectDB()

server.listen(PORT, () => {
  logger.info(`[Server] Started port ${PORT}`)
})

process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received. Closing HTTP server...')
  server.close(() => {
    logger.info('HTTP server closed.')
  })
})
