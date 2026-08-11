import type { Migration } from '../types'
import { backfillSeq, renameFields } from '../helpers'

/** Cashregisters + accounts: FK array renames and seq backfill. */
export const migration007Cashregisters: Migration = {
  id: '007',
  name: 'cashregisters',
  async up({ db, log }) {
    const cashregisters = db.collection('cashregisters')
    const accounts = db.collection('cashregister-accounts')

    await renameFields(cashregisters, {
      accounts: 'accountIds',
    }, log)

    await renameFields(accounts, {
      currencies: 'currencyIds',
    }, log)

    await backfillSeq(db, 'cashregisters', 'cashregisters', log)
  },
}
