import type { Migration } from '../types'

export const migration031DropOrderPayments: Migration = {
  id: '031',
  name: 'drop_order_payments_collection',
  async up({ db, log }) {
    const existing = await db.listCollections({ name: 'order-payments' }).hasNext()
    if (!existing) {
      log('  order-payments already absent')
      return
    }
    await db.collection('order-payments').drop()
    log('  dropped order-payments')
  },
}
