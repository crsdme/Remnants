import type { Migration } from '../types'

/** Existing money transactions already affect balances — mark them confirmed. */
export const migration026MoneyTransactionConfirmed: Migration = {
  id: '026',
  name: 'money_transaction_confirmed',
  async up({ db, log }) {
    const txs = db.collection('money-transactions')

    const result = await txs.updateMany(
      { confirmed: { $ne: true } },
      { $set: { confirmed: true } },
    )

    if (result.modifiedCount)
      log(`  marked confirmed: ${result.modifiedCount}`)
    else
      log('  nothing to update')
  },
}
