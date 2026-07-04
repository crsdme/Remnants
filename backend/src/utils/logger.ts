import type { TransformableInfo } from 'logform'
import fs from 'node:fs'
import { createLogger, format, transports } from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'

type ErrorLogInfo = TransformableInfo & {
  code?: string
  statusCode?: number
  description?: string
  source?: string
  sourceLine?: string
  stack?: string
}

const logDir = 'logs'
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir)
}

const myFormat = format.combine(
  format.colorize({ all: true }),
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.printf((info: ErrorLogInfo) => {
    const { timestamp, level, message, stack, code, statusCode, description, source, sourceLine } = info
    const parts = [`[${String(timestamp)}] ${level}: ${String(message)}`]

    if (code !== undefined && code !== '')
      parts.push(`[${code}]`)
    if (statusCode !== undefined)
      parts.push(`(${statusCode})`)
    if (description !== undefined && description !== '')
      parts.push(`— ${description}`)
    if (source !== undefined && source !== '')
      parts.push(`\n  at ${source}`)
    if (sourceLine !== undefined && sourceLine !== '')
      parts.push(`\n  > ${sourceLine}`)
    if (stack !== undefined && stack !== '')
      parts.push(`\n${stack}`)

    return parts.join(' ')
  }),
)

const logger = createLogger({
  level: 'debug',
  format: myFormat,
  transports: [
    new transports.Console(),
    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      level: 'info',
    }),

    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      level: 'error',
    }),
  ],
})

export default logger
