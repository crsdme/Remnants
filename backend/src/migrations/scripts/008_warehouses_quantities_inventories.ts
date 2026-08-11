import type { Migration } from '../types'
import { renameFields, setDefaultWhereMissing } from '../helpers'

/** Warehouse transactions, quantities, inventories. */
export const migration008WarehousesQuantitiesInventories: Migration = {
  id: '008',
  name: 'warehouses_quantities_inventories',
  async up({ db, log }) {
    const txs = db.collection('warehouse-transactions')
    const quantities = db.collection('quantities')
    const inventories = db.collection('inventories')

    await renameFields(txs, {
      fromWarehouse: 'fromWarehouseId',
      toWarehouse: 'toWarehouseId',
    }, log)
    await setDefaultWhereMissing(txs, 'removed', false, log)

    await renameFields(quantities, {
      product: 'productId',
      warehouse: 'warehouseId',
    }, log)

    try {
      await quantities.dropIndex('product_1_warehouse_1')
      log('  dropped index product_1_warehouse_1')
    }
    catch {
      // index may not exist
    }
    await quantities.createIndex({ productId: 1, warehouseId: 1 })
    log('  index productId_1_warehouseId_1 ensured')

    // warehouse → warehouseId
    await renameFields(inventories, {
      warehouse: 'warehouseId',
    }, log)

    // category (string) → categoryIds (array)
    const withCategory = await inventories.find({
      category: { $exists: true },
      categoryIds: { $exists: false },
    }).toArray()

    if (withCategory.length) {
      const ops = withCategory.map(doc => ({
        updateOne: {
          filter: { _id: doc._id },
          update: {
            $set: {
              categoryIds: doc.category ? [doc.category] : [],
            },
            $unset: { category: 1 },
          },
        },
      }))
      await inventories.bulkWrite(ops, { ordered: false })
      log(`  category → categoryIds: ${ops.length}`)
    }

    // leftover category when categoryIds already present
    const cleaned = await inventories.updateMany(
      { category: { $exists: true }, categoryIds: { $exists: true } },
      { $unset: { category: 1 } },
    )
    if (cleaned.modifiedCount)
      log(`  cleaned leftover category: ${cleaned.modifiedCount}`)

    await setDefaultWhereMissing(inventories, 'removed', false, log)
    await setDefaultWhereMissing(inventories, 'categoryIds', [], log)
  },
}
