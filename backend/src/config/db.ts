import dotenv from 'dotenv'
import mongoose from 'mongoose'
import logger from '../utils/logger'

dotenv.config()

const MONGO_URI_TEST = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/testdb'
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/db'

const URL = process.env.NODE_ENV === 'test' ? MONGO_URI_TEST : MONGO_URI

if (process.env.NODE_ENV === 'development')
  mongoose.set('autoIndex', true)

export async function connectDB() {
  try {
    await mongoose.connect(URL)
    logger.info('[MongoDB] Connected to DB')
  }
  catch (error) {
    logger.error('[MongoDB] connection error to DB:', error)
  }
}

export async function disconnectDB() {
  await mongoose.disconnect()
  logger.info('[MongoDB] Disconnected from DB')
}

export async function dropDB() {
  if (process.env.NODE_ENV === 'test') {
    await mongoose.connection.db?.dropDatabase()
    logger.info('[MongoDB] Dropped test DB')
  }
  else {
    logger.warn('[MongoDB] Cannot drop non-test DB')
  }
}
