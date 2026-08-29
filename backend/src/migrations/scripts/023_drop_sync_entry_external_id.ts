import type { Migration } from '../types'

export const migration023DropSyncEntryExternalId: Migration = {
  id: '023',
  name: 'drop_sync_entry_external_id',
  async up({ db, log }) {
    const collection = db.collection('sync-entries')

    const copied = await collection.updateMany(
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
    if (copied.modifiedCount)
      log(`  copied leftover externalId → externalIds: ${copied.modifiedCount}`)

    const unset = await collection.updateMany(
      { externalId: { $exists: true } },
      { $unset: { externalId: 1 } },
    )
    if (unset.modifiedCount)
      log(`  unset externalId: ${unset.modifiedCount}`)

    try {
      await collection.dropIndex('externalId_1')
      log('  dropped index externalId_1')
    }
    catch (error) {
      const code = typeof error === 'object' && error !== null && 'code' in error
        ? (error as { code?: number }).code
        : undefined
      if (code !== 27)
        throw error
      log('  index externalId_1 already absent')
    }

    await collection.createIndex({ externalIds: 1 })
    log('  ensured index externalIds_1')
  },
}
