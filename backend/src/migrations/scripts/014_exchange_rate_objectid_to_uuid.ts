import type { Document } from 'mongodb'
import type { Migration } from '../types'
import { v4 as uuidv4 } from 'uuid'

/** Replace legacy ObjectId _ids on exchange-rates with UUID strings. */
export const migration014ExchangeRateObjectIds: Migration = {
  id: '014',
  name: 'exchange_rate_objectid_to_uuid',
  async up({ db, log }) {
    const rates = db.collection('exchange-rates')
    const docs = await rates.find({ _id: { $type: 'objectId' } }).toArray()

    if (!docs.length) {
      log('  nothing to update')
      return
    }

    for (const doc of docs) {
      const { _id, ...rest } = doc
      await rates.insertOne({ ...rest, _id: uuidv4() } as Document)
      await rates.deleteOne({ _id })
    }

    log(`  converted ${docs.length} exchange-rates to UUID _id`)
  },
}
