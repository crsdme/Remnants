import http from 'node:http'
import { connectDB, initStorageDirectories } from '@/config/'

import app from '@/index'
import { initSocket } from '@/sockets'
import logger from '@/utils/logger'

const PORT = process.env.PORT ?? 5000

const server = http.createServer(app)

initSocket(server)
initStorageDirectories()

async function bootstrap() {
  await connectDB()
  server.listen(PORT, () => {
    logger.info(`[Server] Started port ${PORT}`)
  })
}

void bootstrap()

process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received. Closing HTTP server...')
  server.close(() => {
    logger.info('HTTP server closed.')
  })
})
