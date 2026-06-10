import mongoose from 'mongoose'
import { connectDB } from '../../config/db'

export async function clearDB() {
  console.log('🧨 Connecting to MongoDB...')
  await connectDB()

  const db = mongoose.connection.db
  if (!db) {
    console.error('❌ Failed to access database connection.')
    return
  }

  const collections = await db.listCollections().toArray()

  if (collections.length === 0) {
    console.log('📭 No collections found.')
    return
  }

  console.log(`⚠️ Dropping ${collections.length} collections...`)

  for (const collection of collections) {
    const name = collection.name
    try {
      await db.dropCollection(name)
      console.log(`🗑️ Dropped: ${name}`)
    }
    catch (error) {
      if (error instanceof Error && 'codeName' in error && error.codeName !== 'NamespaceNotFound') {
        console.error(`❌ Failed to drop collection ${name}:`, error)
      }
    }
  }

  console.log('✅ All collections dropped. Database is clean.')
}
