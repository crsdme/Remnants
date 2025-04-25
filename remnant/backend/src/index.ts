import cookieParser from 'cookie-parser'
import cors from 'cors'
// src/app.ts
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { errorHandler } from './middleware/error.middleware'
import routes from './routes/'

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
app.use(morgan('dev'))

app.use('/api', routes)

app.use(errorHandler)

export default app
