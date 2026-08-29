import type { Migration } from '../types'

/**
 * Inventory seq counter was behind existing documents, so new drafts reused
 * seq 1/2 that already belonged to confirmed inventories. Renumber collisions
 * (keep oldest seq) and sync the counter to max(seq).
 */
export const migration020InventorySeqCounterSync: Migration = {
  id: '020',
  name: 'inventory_seq_counter_sync',
  async up({ db, log }) {
    const inventories = db.collection('inventories')
    const counters = db.collection('counters')

    const maxDoc = await inventories.find({}).sort({ seq: -1 }).limit(1).next()
    let nextSeq = typeof maxDoc?.seq === 'number' ? maxDoc.seq : 0

    const dupes = await inventories.aggregate<{
      _id: number
      docs: Array<{ id: string, createdAt: Date }>
    }>([
      {
        $group: {
          _id: '$seq',
          count: { $sum: 1 },
          docs: {
            $push: {
              id: '$_id',
              createdAt: '$createdAt',
            },
          },
        },
      },
      { $match: { count: { $gt: 1 } } },
    ]).toArray()

    for (const dupe of dupes) {
      const sorted = [...dupe.docs].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      )

      for (const doc of sorted.slice(1)) {
        nextSeq += 1
        await inventories.updateOne({ _id: doc.id }, { $set: { seq: nextSeq } })
        log(`  renumbered ${doc.id}: ${dupe._id} → ${nextSeq}`)
      }
    }

    await counters.updateOne(
      { _id: 'inventory' },
      { $set: { seq: nextSeq } },
      { upsert: true },
    )
    log(`  inventory counter set to ${nextSeq}`)
  },
}
