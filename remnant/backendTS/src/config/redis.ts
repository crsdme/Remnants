// src/config/redis.ts
import redis from "redis";
import dotenv from "dotenv";

dotenv.config();

const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379;
const REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1";

export const redisClient = redis.createClient({
  socket: {
    host: REDIS_HOST,
    port: REDIS_PORT,
  },
});

redisClient
  .connect()
  .then(() => console.log("Connected to Redis"))
  .catch((err) => console.error("Redis connection error:", err));
