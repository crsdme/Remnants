import type { MigrationStore } from '../types'
import type { Db } from 'mongodb'

const COLLECTION = '_migrations'

export function createMongoMigrationStore(db: Db): MigrationStore {
  const collection = db.collection(COLLECTION)

  return {
    async ensureReady() {
      await collection.createIndex({ id: 1 }, { unique: true })
    },

    async listApplied() {
      const docs = await collection
        .find({}, { projection: { _id: 0, id: 1, name: 1, appliedAt: 1 } })
        .sort({ id: 1 })
        .toArray()

      return docs.map(doc => ({
        id: String(doc.id),
        name: String(doc.name),
        appliedAt: doc.appliedAt instanceof Date ? doc.appliedAt : new Date(String(doc.appliedAt)),
      }))
    },

    async markApplied(id: string, name: string) {
      await collection.updateOne(
        { id },
        {
          $setOnInsert: {
            id,
            name,
            appliedAt: new Date(),
          },
        },
        { upsert: true },
      )
    },
  }
}
