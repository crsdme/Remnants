import { exec } from 'node:child_process'
import path from 'node:path'
import { promisify } from 'node:util'
import { config } from 'dotenv'
import { connectDB } from '../../config/db'

const execAsync = promisify(exec)

config()

const MONGO_URI = process.env.MONGO_URI ?? 'mongodb://localhost:27017/db'
const BACKUP_DIR = path.resolve(__dirname, '../../../backups')

export async function backupDB() {
  console.log('📦 Starting MongoDB backup...')

  try {
    await connectDB()

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupPath = path.join(BACKUP_DIR, `backup-${timestamp}`)

    const cmd = `mongodump --uri="${MONGO_URI}" --out="${backupPath}"`
    console.log(`🔄 Running: ${cmd}`)

    await execAsync(cmd)

    console.log(`✅ Backup completed: ${backupPath}`)
  }
  catch (error) {
    console.error('❌ Backup failed:', error)
    process.exit(1)
  }
}

backupDB()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Error backup:', err)
    process.exit(1)
  })
