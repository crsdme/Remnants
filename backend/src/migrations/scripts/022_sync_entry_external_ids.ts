import type { Migration } from '../types'

export const migration022SyncEntryExternalIds: Migration = {
  id: '022',
  name: 'sync_entry_external_ids',
  async up({ db, log }) {
    const collection = db.collection('sync-entries')
    const result = await collection.updateMany(
      {
        $or: [
          { externalIds: { $exists: false } },
          { externalIds: { $size: 0 } },
        ],
        externalId: { $type: 'string', $ne: '' },
      },
      [
        {
          $set: {
            externalIds: ['$externalId'],
          },
        },
      ],
    )
    log(`  copied externalId → externalIds: ${result.modifiedCount}`)
  },
}
