import type { Migration } from '../types'
import { renameFields } from '../helpers'

/**
 * Procurements + items.
 * Note: procurement-items.purchasePrice stays major (matches current schema).
 */
export const migration006Procurements: Migration = {
  id: '006',
  name: 'procurements',
  async up({ db, log }) {
    const procurements = db.collection('procurements')
    const items = db.collection('procurement-items')

    await renameFields(procurements, {
      supplier: 'supplierId',
      expenses: 'expenseIds',
      payments: 'paymentIds',
    }, log)

    await renameFields(items, {
      purchaseCurrency: 'purchaseCurrencyId',
    }, log)
  },
}
