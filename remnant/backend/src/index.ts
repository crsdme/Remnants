import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { errorHandler } from './middleware/error.middleware'
import { requestLogger } from './middleware/logger.middleware'
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
app.use(requestLogger)
app.use(errorHandler)

app.use('/api', routes)

app.get('/health', (req, res) => {
  res.status(200).send('OK')
})

export default app
