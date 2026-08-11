import type { Migration } from '../types'
import { convertMoneyFields, loadCurrencyScales, renameFields } from '../helpers'

/** Expenses: money → minor*, FK renames, sourceModel remap. */
export const migration005Expenses: Migration = {
  id: '005',
  name: 'expenses',
  async up({ db, log }) {
    const expenses = db.collection('expenses')
    const scales = await loadCurrencyScales(db)

    await convertMoneyFields(expenses, scales, [
      { from: 'amount', to: 'minorAmount', currencyFrom: 'currency', currencyTo: 'currencyId' },
    ], log)

    await renameFields(expenses, {
      currency: 'currencyId',
      cashregister: 'cashregisterId',
      cashregisterAccount: 'cashregisterAccountId',
      categories: 'categoryIds',
    }, log)

    const remapped = await expenses.updateMany(
      { sourceModel: 'expense-category' },
      { $set: { sourceModel: 'expense' } },
    )
    if (remapped.modifiedCount)
      log(`  sourceModel expense-category → expense: ${remapped.modifiedCount}`)
  },
}
