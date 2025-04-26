import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { errorHandler } from './middleware/error.middleware'
import { requestLogger } from './middleware/logger.middleware'
import apiRoutes from './routes/api'
import healthRoutes from './routes/health'

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }),
)
app.use(helmet())
app.use(requestLogger)
app.use(errorHandler)

app.use('/api', apiRoutes)
app.use('/health', healthRoutes)

export default app
