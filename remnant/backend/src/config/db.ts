import dotenv from 'dotenv'
import mongoose from 'mongoose'

dotenv.config()

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/db'

mongoose 
          .connect(MONGO_URI)  
  .then(() => console.log('[MongoDB] Connected to DB'))
  .catch(err => console.error('[MongoDB] connection error to DB:', err))
 