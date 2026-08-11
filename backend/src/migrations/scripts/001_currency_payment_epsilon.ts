import type { Migration } from '../types'
import { defaultPaymentEpsilon } from '@/utils/money'

/** Backfill Currency.paymentEpsilon from scale. */
export const migration001CurrencyPaymentEpsilon: Migration = {
  id: '001',
  name: 'currency_payment_epsilon',
  async up({ db, log }) {
    const currencies = db.collection('currencies')
    const docs = await currencies
      .find({
        $or: [
          { paymentEpsilon: { $exists: false } },
          { paymentEpsilon: null },
        ],
      })
      .toArray()

    if (!docs.length) {
      log('  nothing to update')
      return
    }

    const ops = docs.map((doc) => {
      const scale = typeof doc.scale === 'number' ? doc.scale : 2
      return {
        updateOne: {
          filter: { _id: doc._id },
          update: { $set: { paymentEpsilon: defaultPaymentEpsilon(scale) } },
        },
      }
    })

    await currencies.bulkWrite(ops, { ordered: false })
    log(`  updated ${ops.length} currencies`)
  },
}
