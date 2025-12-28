import { ProductModel, SiteModel } from '../models'
import * as ProductService from '../services/product.service'
import * as SyncEntryService from '../services/sync-entry.service'
import * as TelegramBotService from '../services/telegram-bot.service'
// import * as WarehouseTransactionService from '../services/warehouse-transaction.service'
import { HttpError } from '../utils/httpError'
import { getHardcodeData } from '../utils/mongodb/hardcode'

export async function start(payload: { key: string }) {
  const actions = {
    createProducts,
    createTelegramProducts,
    quantityProducts,
    addProductCategories,
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
    pagination: { full: true },
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

async function addProductCategories() {
  const { propertyIds, hairLengths } = getHardcodeData()
  const { products } = await ProductService.get({
    pagination: { full: true },
  })

  function getHairLengthCategoryId(lengthCm: number): string | null {
    if (lengthCm < 40 || lengthCm > 104)
      return null

    const bucketStart = Math.floor((lengthCm - 40) / 5) * 5 + 40 as keyof typeof hairLengths

    return hairLengths[bucketStart]
  }

  for (const product of products) {
    const lengthProperty = product.productProperties.find(property => property.id === propertyIds.LENGTH)
    const newHairCategory = getHairLengthCategoryId(lengthProperty?.value || 0)
    const newProduct = await ProductModel.findOneAndUpdate({ _id: product.id }, { $addToSet: { categories: newHairCategory } })

    console.log(newProduct)
  }
}
