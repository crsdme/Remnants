import type { Migration } from '../types'
import {
  CASHREGISTER_CAPABILITIES,
  WAREHOUSE_CAPABILITIES,
} from '@remnant/shared'

/**
 * Convert flat warehouseIds / cashregisterIds to capability entries.
 * Existing ids get full capability sets so access is not reduced.
 */
export const migration024UserAccessCapabilities: Migration = {
  id: '024',
  name: 'user_access_capabilities',
  async up({ db, log }) {
    const accesses = db.collection('user-accesses')

    const docs = await accesses.find({}).toArray()
    if (!docs.length) {
      log('  no user-accesses')
      return
    }

    let updated = 0
    for (const doc of docs) {
      const warehouseIds = Array.isArray(doc.warehouseIds)
        ? doc.warehouseIds.filter((id): id is string => typeof id === 'string')
        : []
      const cashregisterIds = Array.isArray(doc.cashregisterIds)
        ? doc.cashregisterIds.filter((id): id is string => typeof id === 'string')
        : []

      const existingWarehouses = Array.isArray(doc.warehouses) ? doc.warehouses : null
      const existingCashregisters = Array.isArray(doc.cashregisters) ? doc.cashregisters : null

      const warehouses = existingWarehouses ?? warehouseIds.map(id => ({
        id,
        capabilities: [...WAREHOUSE_CAPABILITIES],
      }))

      const cashregisters = existingCashregisters ?? cashregisterIds.map(id => ({
        id,
        capabilities: [...CASHREGISTER_CAPABILITIES],
      }))

      await accesses.updateOne(
        { _id: doc._id },
        {
          $set: {
            warehouses,
            cashregisters,
            updatedAt: new Date(),
          },
          $unset: {
            warehouseIds: '',
            cashregisterIds: '',
          },
        },
      )
      updated += 1
    }

    log(`  migrated user-accesses: ${updated}`)
  },
}
