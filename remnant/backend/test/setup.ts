import { afterAll, afterEach, beforeAll } from 'vitest'
import { connectDB, disconnectDB, dropDB } from '../src/config/db'

beforeAll(async () => {
  await connectDB()
})

afterEach(async () => {
  // await dropDB()
})

afterAll(async () => {
  await dropDB()
  await disconnectDB()
})
