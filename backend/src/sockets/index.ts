import type { Server } from 'node:http'
import { Server as SocketIOServer } from 'socket.io'
import { HttpError } from '../utils/httpError'
import logger from '../utils/logger'

let io: SocketIOServer

export function initSocket(server: Server): void {
  io = new SocketIOServer(server, {
    cors: {
      origin: '*',
    },
  })

  io.on('connection', (socket) => {
    logger.info(`A user connected: ${socket.id}`)

    socket.on('message', (data) => {
      logger.info(`Received message: ${data}`)
      io.emit('message', data)
    })

    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.id}`)
    })
  })
}

export function getIO(): SocketIOServer {
  if (!io) {
    logger.error('Socket.io not initialized')
    throw new HttpError(500, 'Socket.io not initialized', 'SOCKET_IO_NOT_INITIALIZED')
  }
  return io
}
