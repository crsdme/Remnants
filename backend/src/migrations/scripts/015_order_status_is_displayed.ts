import type { Migration } from '../types'

/** Backfill isDisplayed on order statuses (default true for existing docs). */
export const migration015OrderStatusIsDisplayed: Migration = {
  id: '015',
  name: 'order_status_is_displayed',
  async up({ db, log }) {
    const statuses = db.collection('order-statuses')

    const result = await statuses.updateMany(
      { isDisplayed: { $exists: false } },
      { $set: { isDisplayed: true } },
    )
    if (result.modifiedCount)
      log(`  set isDisplayed=true: ${result.modifiedCount}`)
  },
}
