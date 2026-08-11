import mongoose from 'mongoose'
import { connectDB, disconnectDB } from '@/config/db'
import { runMigrations } from './runner'
import { migrations } from './registry'
import { createMongoMigrationStore } from './store/mongo.migration.store'

async function main() {
  console.log('🚀 Running database migrations...')
  await connectDB()

  const db = mongoose.connection.db
  if (!db)
    throw new Error('MongoDB connection is not ready')

  const store = createMongoMigrationStore(db)
  await runMigrations(store, migrations, {
    db,
    log: message => console.log(message),
  })

  await disconnectDB()
  console.log('🎉 Migrations finished')
}

main()
  .then(() => process.exit(0))
  .catch(async (err) => {
    console.error('❌ Migration failed:', err)
    try {
      await disconnectDB()
    }
    catch {
      // ignore
    }
    process.exit(1)
  })
