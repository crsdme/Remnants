// import dotenv from 'dotenv'
// import redis from 'redis'
// import logger from '../utils/logger'

// dotenv.config()

// const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379
// const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1'

// export const redisClient = redis.createClient({
//   socket: {
//     host: REDIS_HOST,
//     port: REDIS_PORT,
//   },
// })

// redisClient
//   .connect()
//   .then(() => logger.info('[Redis] Connected to DB'))
//   .catch(err => logger.error('[Redis] Connection error:', err))
