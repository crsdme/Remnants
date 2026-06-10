import { afterAll, beforeAll } from 'vitest'
import { connectDB, disconnectDB } from '../src/config/db'

beforeAll(async () => {
  await connectDB()
})

// afterEach(async () => {
//   await dropDB()
// })

afterAll(async () => {
  await disconnectDB()
})
