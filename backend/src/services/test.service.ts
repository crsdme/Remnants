import { SiteModel } from '../models'
import * as ProductService from '../services/product.service'
import * as SyncEntryService from '../services/sync-entry.service'
import * as TelegramBotService from '../services/telegram-bot.service'
import * as WarehouseTransactionService from '../services/warehouse-transaction.service'

export async function start() {
  const { products } = await ProductService.get({
    pagination: { current: 1, pageSize: 400 },
  })

  const sites = await SiteModel.find({})
  const sitesId = sites.map(site => site.id)

  for (const site of sitesId) {
    for (const product of products) {
      await SyncEntryService.createSiteSync({
        siteId: site,
        productId: product.id,
      })
    }
  }

  // await TelegramBotService.sendMessage(products[0])

  // for (const product of products) {
  // await TelegramBotService.sendMessage(product)
  // await SyncEntryService.syncProductToSite({
  //   site,
  //   productId: product.id,
  // })
  // }

  return { status: 'success', code: 'TEST', message: 'TEST' }
}
