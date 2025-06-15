import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import { helmetConfig } from './config/helmet'

import { scalar } from './config/scalar'
import { errorHandler } from './middleware/error.middleware'

import { requestLogger } from './middleware/logger.middleware'
import apiRoutes from './routes/api'
import healthRoutes from './routes/health'
import storageRoutes from './routes/storage'

const app = express()

app.use(express.json())

app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
)
app.use(helmetConfig)
app.use(requestLogger)

app.use('/docs', scalar)
app.use('/api', apiRoutes)
app.use('/health', healthRoutes)
app.use('/storage', storageRoutes)

app.use(errorHandler)

export default app
