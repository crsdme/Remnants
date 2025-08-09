import { SiteModel } from '../models'
import * as ProductService from '../services/product.service'
import * as SyncEntryService from '../services/sync-entry.service'
import * as TelegramBotService from '../services/telegram-bot.service'
import * as WarehouseTransactionService from '../services/warehouse-transaction.service'
import { HttpError } from '../utils/httpError'

export async function start(payload: { key: string }) {
  const actions = {
    createProducts,
    createTelegramProducts,
    quantityProducts,
  }

  const action = actions[payload.key as keyof typeof actions]

  if (!action)
    throw new HttpError(400, 'Invalid action', 'INVALID_ACTION')

  await action()

  return { status: 'success', code: 'TEST', message: 'TEST' }
}

async function createProducts() {
  const { products } = await ProductService.get({
    pagination: { current: 1, pageSize: 1000 },
  })

  const sites = await SiteModel.find({})
  const sitesId = sites.map(site => site.id)

  for (const site of sitesId) {
    for (const product of products) {
      await SyncEntryService.syncProductCreate({
        siteId: site,
        productId: product.id,
      })
    }
  }
}

async function quantityProducts() {
  const { products } = await ProductService.get({
    pagination: { current: 1, pageSize: 400 },
  })

  const sites = await SiteModel.find({})
  const sitesId = sites.map(site => site.id)

  for (const site of sitesId) {
    for (const product of products) {
      const data = await SyncEntryService.syncProductQuantity({
        siteId: site,
        productId: product.id,
      })

      console.log(data)
    }
  }
}

async function createTelegramProducts() {
  const { products } = await ProductService.get({
    pagination: { current: 1, pageSize: 400 },
  })

  for (const product of products) {
    await TelegramBotService.sendMessage(product)
  }
}
