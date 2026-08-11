import type { Migration } from '../types'
import { v4 as uuidv4 } from 'uuid'

/** Replace legacy ObjectId _ids on inventory-items with UUID strings. */
export const migration016InventoryItemObjectIds: Migration = {
  id: '016',
  name: 'inventory_item_objectid_to_uuid',
  async up({ db, log }) {
    const items = db.collection('inventory-items')
    const docs = await items.find({ _id: { $type: 'objectId' } }).toArray()

    if (!docs.length) {
      log('  nothing to update')
      return
    }

    let converted = 0
    let removedDuplicates = 0

    for (const doc of docs) {
      const { _id, ...rest } = doc

      const existingUuid = await items.findOne({
        _id: { $type: 'string' },
        inventoryId: doc.inventoryId,
        productId: doc.productId,
      })

      if (existingUuid) {
        await items.deleteOne({ _id })
        removedDuplicates += 1
        continue
      }

      await items.deleteOne({ _id })
      await items.insertOne({ ...rest, _id: uuidv4() })
      converted += 1
    }

    log(`  converted ${converted} inventory-items to UUID _id`)
    if (removedDuplicates)
      log(`  removed ${removedDuplicates} ObjectId duplicates`)
  },
}
