import type { Migration } from '../types'

/** Map legacy inventory statuses awaiting/received → confirmed (receive flow removed). */
export const migration017InventoryDropAwaitingReceived: Migration = {
  id: '017',
  name: 'inventory_drop_awaiting_received',
  async up({ db, log }) {
    const inventories = db.collection('inventories')

    const result = await inventories.updateMany(
      { status: { $in: ['awaiting', 'received'] } },
      { $set: { status: 'confirmed' } },
    )

    if (result.modifiedCount)
      log(`  remapped awaiting/received → confirmed: ${result.modifiedCount}`)
    else
      log('  nothing to update')
  },
}
