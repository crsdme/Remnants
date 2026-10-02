import type { Migration } from '../types'
import { backfillSeq } from '../helpers'

export const migration028SupplierSeq: Migration = {
  id: '028',
  name: 'supplier_seq',
  async up({ db, log }) {
    await backfillSeq(db, 'suppliers', 'suppliers', log)
  },
}
