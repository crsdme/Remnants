import type { Document, Filter } from 'mongodb'
import type { Migration } from '../types'
import { validate as isUuid, v4 as uuidv4 } from 'uuid'

const OBJECT_ID_HEX = /^[a-fA-F0-9]{24}$/

function isLegacyObjectId(_id: unknown): boolean {
  if (_id != null && typeof _id === 'object' && 'toHexString' in (_id as object))
    return true
  if (typeof _id === 'string')
    return OBJECT_ID_HEX.test(_id) && !isUuid(_id)
  return false
}

/** Replace legacy ObjectId / ObjectId-string _ids on order-items with UUID strings. */
export const migration019OrderItemObjectIds: Migration = {
  id: '019',
  name: 'order_item_objectid_to_uuid',
  async up({ db, log }) {
    const items = db.collection('order-items')

    const asObjectId = await items.find({ _id: { $type: 'objectId' } }).toArray()
    const asHexString = await items.find(
      { _id: { $regex: OBJECT_ID_HEX.source } } as unknown as Filter<Document>,
    ).toArray()

    const seen = new Set<string>()
    const legacy: Document[] = []
    for (const doc of [...asObjectId, ...asHexString]) {
      if (!isLegacyObjectId(doc._id))
        continue
      const key = String(doc._id)
      if (seen.has(key))
        continue
      seen.add(key)
      legacy.push(doc)
    }

    if (!legacy.length) {
      log('  nothing to update')
      return
    }

    let converted = 0

    for (const doc of legacy) {
      const { _id, ...rest } = doc
      await items.deleteOne({ _id })
      await items.insertOne({ ...rest, _id: uuidv4() } as Document)
      converted += 1
    }

    log(`  converted ${converted} order-items to UUID _id`)
  },
}
