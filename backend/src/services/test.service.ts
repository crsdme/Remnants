import { v4 as uuidv4 } from 'uuid'
import * as ProductService from '../services/product.service'
import * as SyncEntryService from '../services/sync-entry.service'

export async function start() {
  const products = await ProductService.get({
    pagination: { current: 1, pageSize: 10 },
  })
  const site = '8dd55bf3-f116-4d27-9d5b-f2c10c54936d'

  await SyncEntryService.syncProductToSite({
    site,
    productId: products.products[0].id,
  })
  // for (const product of products) {
  //   await SyncEntryService.create({ sourceType: 'product', sourceId: product.id, site })
  // }
  return { status: 'success', code: 'TEST', message: 'TEST' }
}
