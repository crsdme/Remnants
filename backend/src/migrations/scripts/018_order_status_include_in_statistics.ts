import type { Migration } from '../types'

/** Backfill includeInStatistics on order statuses (default true for existing docs). */
export const migration018OrderStatusIncludeInStatistics: Migration = {
  id: '018',
  name: 'order_status_include_in_statistics',
  async up({ db, log }) {
    const statuses = db.collection('order-statuses')

    const result = await statuses.updateMany(
      { includeInStatistics: { $exists: false } },
      { $set: { includeInStatistics: true } },
    )
    if (result.modifiedCount)
      log(`  set includeInStatistics=true: ${result.modifiedCount}`)
  },
}
