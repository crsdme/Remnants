import * as ProductService from '../services/product.service'
import * as SyncEntryService from '../services/sync-entry.service'

export async function start() {
  const { products } = await ProductService.get({
    pagination: { current: 1, pageSize: 400 },
  })
  const site = '8dd55bf3-f116-4d27-9d5b-f2c10c54936d'

  for (const product of products) {
    await SyncEntryService.syncProductToSite({
      site,
      productId: product.id,
    })
  }
  return { status: 'success', code: 'TEST', message: 'TEST' }
}
