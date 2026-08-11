import type { Migration } from '../types'

/** Remove legacy per-payment paymentStatus; order-level orderPaymentStatus remains. */
export const migration013DropOrderPaymentStatus: Migration = {
  id: '013',
  name: 'drop_order_payment_status',
  async up({ db, log }) {
    const payments = db.collection('order-payments')

    const unsetResult = await payments.updateMany(
      { paymentStatus: { $exists: true } },
      { $unset: { paymentStatus: 1 } },
    )
    if (unsetResult.modifiedCount)
      log(`  unset paymentStatus: ${unsetResult.modifiedCount}`)

    try {
      await payments.dropIndex('paymentStatus_1')
      log('  dropped index paymentStatus_1')
    }
    catch (error) {
      const code = typeof error === 'object' && error !== null && 'code' in error
        ? (error as { code?: number }).code
        : undefined
      if (code !== 27)
        throw error
      log('  index paymentStatus_1 already absent')
    }
  },
}
