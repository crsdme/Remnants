import type { Migration } from '../types'
import { WAREHOUSE_CAPABILITIES } from '@remnant/shared'

/**
 * Remove obsolete warehouses.viewHistory capability.
 * Quantity / lots history is gated by product.quantityLogs role permission.
 */
export const migration032DropWarehouseViewHistory: Migration = {
  id: '032',
  name: 'drop_warehouse_view_history',
  async up({ db, log }) {
    const accesses = db.collection('user-accesses')
    const docs = await accesses.find({}).toArray()
    if (!docs.length) {
      log('  no user-accesses')
      return
    }

    const allowed = new Set<string>(WAREHOUSE_CAPABILITIES)
    let updated = 0

    for (const doc of docs) {
      const rawWarehouses = Array.isArray(doc.warehouses) ? doc.warehouses : []
      if (rawWarehouses.length === 0)
        continue

      const warehouses = rawWarehouses
        .map((entry: { id?: string, capabilities?: string[] }) => {
          if (typeof entry?.id !== 'string' || entry.id === '')
            return null

          const capabilities = (Array.isArray(entry.capabilities) ? entry.capabilities : [])
            .filter((cap): cap is string => typeof cap === 'string' && allowed.has(cap))

          if (capabilities.length === 0)
            return null

          return { id: entry.id, capabilities }
        })
        .filter((entry): entry is { id: string, capabilities: string[] } => entry != null)

      const changed = JSON.stringify(rawWarehouses) !== JSON.stringify(warehouses)
      if (!changed)
        continue

      await accesses.updateOne(
        { _id: doc._id },
        { $set: { warehouses, updatedAt: new Date() } },
      )
      updated += 1
    }

    log(`  cleaned warehouse viewHistory from user-accesses: ${updated}`)
  },
}
