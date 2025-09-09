import type * as SyncEntryTypes from '../types/sync-entry.type'
import axios from 'axios'
import slugify from 'slugify'
import { STORAGE_URLS } from '../config/constants'
import { QuantityModel, SiteModel, SyncEntryModel } from '../models'
import { buildUrl } from '../utils/buildUrl'
import { HttpError } from '../utils/httpError'
import { buildQuery, buildSortQuery } from '../utils/queryBuilder'
import * as ProductService from './product.service'

export async function get(payload: SyncEntryTypes.getSyncEntriesParams): Promise<SyncEntryTypes.getSyncEntriesResult> {
  const { current = 1, pageSize = 10 } = payload.pagination || {}

  const {
    sourceType = '',
    sourceId = '',
    site = '',
    externalId = '',
  } = payload.filters || {}

  const sorters = buildSortQuery(payload.sorters || {}, { count: 1 })

  const filterRules = {
    sourceType: { type: 'exact' },
    sourceId: { type: 'exact' },
    site: { type: 'exact' },
    externalId: { type: 'exact' },
  } as const

  const query = buildQuery({
    filters: { sourceType, sourceId, site, externalId },
    rules: filterRules,
  })

  const pipeline = [
    {
      $match: query,
    },
    {
      $sort: sorters,
    },
    {
      $facet: {
        syncEntries: [
          { $skip: (current - 1) * pageSize },
          { $limit: pageSize },
        ],
        totalCount: [
          { $count: 'count' },
        ],
      },
    },
  ]

  const syncEntriesRaw = await SyncEntryModel.aggregate(pipeline).exec()

  const syncEntries = syncEntriesRaw[0].syncEntries
  const syncEntriesCount = syncEntriesRaw[0].totalCount[0]?.count || 0

  return { status: 'success', code: 'SYNC_ENTRIES_FETCHED', message: 'Sync entries fetched', syncEntries, syncEntriesCount }
}

export async function create(payload: SyncEntryTypes.createSyncEntryParams): Promise<SyncEntryTypes.createSyncEntryResult> {
  const {
    sourceType,
    site,
  } = payload

  const syncEntry = await SyncEntryModel.create({
    sourceType,
    site,
  })

  return { status: 'success', code: 'SYNC_ENTRY_CREATED', message: 'Sync entry created', syncEntry }
}

export async function edit(payload: SyncEntryTypes.editSyncEntryParams): Promise<SyncEntryTypes.editSyncEntryResult> {
  const {
    id,
    site,
    sourceType,
  } = payload

  const syncEntry = await SyncEntryModel.findOneAndUpdate({ _id: id }, {
    site,
    sourceType,
  })

  if (!syncEntry) {
    throw new HttpError(400, 'Sync entry not edited', 'SYNC_ENTRY_NOT_EDITED')
  }

  return { status: 'success', code: 'SYNC_ENTRY_EDITED', message: 'Sync entry edited', syncEntry }
}

export async function remove(payload: SyncEntryTypes.removeSyncEntriesParams): Promise<SyncEntryTypes.removeSyncEntriesResult> {
  const { ids } = payload

  const syncEntries = await SyncEntryModel.updateMany(
    { _id: { $in: ids } },
    { $set: { removed: true } },
  )

  if (!syncEntries) {
    throw new HttpError(400, 'Sync entries not removed', 'SYNC_ENTRIES_NOT_REMOVED')
  }

  return { status: 'success', code: 'SYNC_ENTRIES_REMOVED', message: 'Sync entries removed' }
}

export async function syncProductCreate(payload: SyncEntryTypes.syncProductCreateParams): Promise<SyncEntryTypes.syncProductCreateResult> {
  const { siteId, productId } = payload

  const site = await SiteModel.findOne({ _id: siteId })

  if (!site) {
    throw new HttpError(400, 'Site not found', 'SITE_NOT_FOUND')
  }

  const syncEntry = await SyncEntryModel.findOne({ sourceType: 'product', sourceId: productId, site: siteId })

  if (!syncEntry) {
    await SyncEntryModel.create({ sourceType: 'product', sourceId: productId, site: siteId, status: 'pending' })
  }

  const { products: [product] } = await ProductService.get({
    filters: { ids: [productId] },
  })

  const weightProperty = product.productProperties.find(property => property.id === '7c3e2c1b-f2bf-4639-baf2-7b1101fa7bf2')
  const lengthProperty = product.productProperties.find(property => property.id === 'efcc3c51-a146-4975-bc5b-196745f76891')
  const typeProperty = product.productProperties.find(property => property.id === '25144e64-5c4c-47fd-842d-c0a2393f972e')

  const isCurly = (typeProperty?.value || []).includes('822ec142-d144-44fb-ba96-582cff8757b3')
  const isVirgin = (typeProperty?.value || []).includes('b930fb75-61a6-41c0-88de-0c69082b7f06')
  const isSilky = (typeProperty?.value || []).includes('aeb36d06-1a12-4319-9313-51abcbed38fb')

  function getProductCategory(lengthCm: number): string | null {
    const table = [
      { min: 40, max: 44, category: '40-44' },
      { min: 45, max: 49, category: '45-49' },
      { min: 50, max: 54, category: '50-54' },
      { min: 55, max: 59, category: '55-59' },
      { min: 60, max: 64, category: '60-64' },
      { min: 65, max: 69, category: '65-69' },
      { min: 70, max: 74, category: '70-74' },
      { min: 75, max: 79, category: '75-79' },
      { min: 80, max: 84, category: '80-84' },
      { min: 85, max: 89, category: '85-89' },
      { min: 90, max: 94, category: '90-94' },
      { min: 95, max: 99, category: '95-99' },
    ]

    for (const row of table) {
      if (lengthCm >= row.min && lengthCm <= row.max) {
        return row.category
      }
    }
    return null
  }

  const categoriesIds = {
    'Silky': 222,
    'Silky.50-54': 229,
    'Silky.55-59': 238,
    'Silky.60-64': 239,
    'Silky.65-69': 240,
    'Silky.70-74': 241,
    'Silky.75-79': 242,
    'Silky.80-84': 243,
    'Silky.85-89': 244,
    'Silky.90-94': 245,
    'Silky.95-99': 246,
    'Silky.Curly': 226,
    'Silky.Curly.50-54': 277,
    'Silky.Curly.55-59': 278,
    'Silky.Curly.60-64': 279,
    'Silky.Curly.65-69': 280,
    'Silky.Curly.70-74': 281,
    'Silky.Curly.75-79': 282,
    'Silky.Curly.80-84': 283,
    'Silky.Curly.85-89': 284,
    'Silky.Curly.90-94': 285,
    'Silky.Curly.95-99': 286,

    'Virgin': 223,
    'Virgin.50-54': 247,
    'Virgin.55-59': 248,
    'Virgin.60-64': 249,
    'Virgin.65-69': 250,
    'Virgin.70-74': 251,
    'Virgin.75-79': 252,
    'Virgin.80-84': 253,
    'Virgin.85-89': 254,
    'Virgin.90-94': 255,
    'Virgin.95-99': 256,
    'Virgin.Curly': 225,
    'Virgin.Curly.50-54': 257,
    'Virgin.Curly.55-59': 258,
    'Virgin.Curly.60-64': 259,
    'Virgin.Curly.65-69': 260,
    'Virgin.Curly.70-74': 261,
    'Virgin.Curly.75-79': 262,
    'Virgin.Curly.80-84': 263,
    'Virgin.Curly.85-89': 264,
    'Virgin.Curly.90-94': 265,
    'Virgin.Curly.95-99': 266,

    'RawHair': 72,
    'RawHair.50-54': 227,
    'RawHair.55-59': 228,
    'RawHair.60-64': 230,
    'RawHair.65-69': 231,
    'RawHair.70-74': 232,
    'RawHair.75-79': 233,
    'RawHair.80-84': 234,
    'RawHair.85-89': 235,
    'RawHair.90-94': 236,
    'RawHair.95-99': 237,
    'RawHair.Curly': 224,
    'RawHair.Curly.50-54': 267,
    'RawHair.Curly.55-59': 268,
    'RawHair.Curly.60-64': 269,
    'RawHair.Curly.65-69': 270,
    'RawHair.Curly.70-74': 271,
    'RawHair.Curly.75-79': 272,
    'RawHair.Curly.80-84': 273,
    'RawHair.Curly.85-89': 274,
    'RawHair.Curly.90-94': 275,
    'RawHair.Curly.95-99': 276,
  }

  function getCategoryIds(path: string) {
    const parts = path.split('.')
    const ids = []

    for (let i = 0; i < parts.length; i++) {
      const key = parts.slice(0, i + 1).join('.')
      if (categoriesIds[key as keyof typeof categoriesIds]) {
        ids.push(categoriesIds[key as keyof typeof categoriesIds])
      }
    }

    return [72, ...ids]
  }

  const categories = getCategoryIds(`${isVirgin ? 'Virgin' : isSilky ? 'Silky' : 'RawHair'}${isCurly ? '.Curly' : ''}.${getProductCategory(lengthProperty?.value || 0)}`)

  const syncProduct = {
    model: `REMNANT NEW PRODUCT`,
    external_id: productId,
    price: product.price,
    translations: [
      {
        name: product.names.ru,
        url: slugify(product.names.ru || '', { lower: true }),
        language_code: 'ru-ru',
      },
      {
        name: product.names.en,
        url: slugify(product.names.en || '', { lower: true }),
        language_code: 'uk-ua',
      },
      {
        name: product.names.en,
        url: slugify(product.names.en || '', { lower: true }),
        language_code: 'en',
      },
      {
        name: product.names.en,
        url: slugify(product.names.en || '', { lower: true }),
        language_code: 'it',
      },
      {
        name: product.names.en,
        url: slugify(product.names.en || '', { lower: true }),
        language_code: 'pl',
      },
    ],
    categories,
    images: product.images.map(image => ({
      image: `${STORAGE_URLS.productImages}/${image.filename}`,
      name: image.filename || '',
    })),
    attributes: [
      {
        attribute_id: 77,
        product_attribute_description: [
          {
            text: `${weightProperty?.value} g`,
            language_code: 'ru-ru',
          },
          {
            text: `${weightProperty?.value} g`,
            language_code: 'uk-ua',
          },
          {
            text: `${weightProperty?.value} g`,
            language_code: 'en',
          },
          {
            text: `${weightProperty?.value} g`,
            language_code: 'it',
          },
          {
            text: `${weightProperty?.value} g`,
            language_code: 'pl',
          },
        ],
      },
      {
        attribute_id: 78,
        product_attribute_description: [
          {
            text: `${lengthProperty?.value} cm`,
            language_code: 'ru-ru',
          },
          {
            text: `${lengthProperty?.value} cm`,
            language_code: 'uk-ua',
          },
          {
            text: `${lengthProperty?.value} cm`,
            language_code: 'en',
          },
          {
            text: `${lengthProperty?.value} cm`,
            language_code: 'it',
          },
          {
            text: `${lengthProperty?.value} cm`,
            language_code: 'pl',
          },
        ],
      },
      ...(isCurly
        ? [{
            attribute_id: 79,
            product_attribute_description: [
              {
                text: `Curly`,
                language_code: 'ru-ru',
              },
              {
                text: `Curly`,
                language_code: 'uk-ua',
              },
              {
                text: `Curly`,
                language_code: 'en',
              },
              {
                text: `Riccia`,
                language_code: 'it',
              },
              {
                text: `Kręcony`,
                language_code: 'pl',
              },
            ],
          }]
        : []),
    ],
    // special: {
    //   price: product.price,
    // },
  }

  const apiUrl = buildUrl(
    site.url,
    '/index.php',
    {
      route: 'extension/remnant/remnant/createProduct',
      key: process.env.REMNANT_API_KEY || '',
    },
  )

  try {
    const response = await axios.post(apiUrl, syncProduct, { headers: { 'Content-Type': 'application/json' } })

    await SyncEntryModel.updateOne({ sourceType: 'product', sourceId: productId, site: siteId }, {
      status: 'synced',
      syncedAt: new Date(),
      externalId: response.data.product_id,
      lastError: null,
    })
  }
  catch (error) {
    await SyncEntryModel.updateOne({ sourceType: 'product', sourceId: product.id, site: siteId }, {
      status: 'error',
      lastError: (error || '').toString(),
    })
  }

  return { status: 'success', code: 'SYNC_ENTRY_CREATED', message: 'Sync entry created' }
}

export async function syncProductEdit(payload: SyncEntryTypes.syncProductEditParams): Promise<SyncEntryTypes.syncProductEditResult> {
  const { siteId, productId, difference } = payload

  if (!difference || Object.keys(difference).length === 0)
    return { status: 'success', code: 'NO_CHANGES', message: 'No changes to sync' }

  const site = await SiteModel.findOne({ _id: siteId })

  if (!site)
    throw new HttpError(400, 'Site not found', 'SITE_NOT_FOUND')

  const syncEntry = await SyncEntryModel.findOne({ sourceType: 'product', sourceId: productId, site: siteId })

  if (!syncEntry)
    return { status: 'error', code: 'SYNC_ENTRY_NOT_FOUND', message: 'Sync entry not found' }

  const { products: [product] } = await ProductService.get({
    filters: { ids: [productId] },
  })

  const syncProduct: Record<string, any> = {
    external_id: productId,
  }

  if (difference.price) {
    syncProduct.price = difference.price
  }

  if (difference.names) {
    syncProduct.translations = [
      {
        name: difference.names.ru ?? product.names.ru,
        url: slugify((difference.names.ru ?? product.names.ru) || '', { lower: true }),
        language_code: 'ru-ru',
      },
      {
        name: difference.names.en ?? product.names.en,
        url: slugify((difference.names.en ?? product.names.en) || '', { lower: true }),
        language_code: 'uk-ua',
      },
      {
        name: difference.names.en ?? product.names.en,
        url: slugify((difference.names.en ?? product.names.en) || '', { lower: true }),
        language_code: 'en',
      },
      {
        name: difference.names.en ?? product.names.en,
        url: slugify((difference.names.en ?? product.names.en) || '', { lower: true }),
        language_code: 'it',
      },
      {
        name: difference.names.en ?? product.names.en,
        url: slugify((difference.names.en ?? product.names.en) || '', { lower: true }),
        language_code: 'pl',
      },
    ]
  }

  if (difference.images) {
    syncProduct.images = difference.images.map((image: any) => ({
      image: `${STORAGE_URLS.productImages}/${image.filename}`,
      name: image.filename || '',
    }))
  }

  if (difference.productProperties) {
    const weightProperty = difference.productProperties.find((p: any) => p._id === '7c3e2c1b-f2bf-4639-baf2-7b1101fa7bf2')
    const lengthProperty = difference.productProperties.find((p: any) => p._id === 'efcc3c51-a146-4975-bc5b-196745f76891')
    const typeProperty = difference.productProperties.find((p: any) => p._id === '25144e64-5c4c-47fd-842d-c0a2393f972e')

    const isCurly = (typeProperty?.value || []).includes('822ec142-d144-44fb-ba96-582cff8757b3')

    syncProduct.attributes = []
    if (weightProperty) {
      syncProduct.attributes.push({
        attribute_id: 77,
        product_attribute_description: [
          {
            text: `${weightProperty.value} g`,
            language_code: 'ru-ru',
          },
          {
            text: `${weightProperty.value} g`,
            language_code: 'uk-ua',
          },
          {
            text: `${weightProperty.value} g`,
            language_code: 'pl',
          },
          {
            text: `${weightProperty.value} g`,
            language_code: 'en',
          },
          {
            text: `${weightProperty.value} g`,
            language_code: 'it',
          },
        ],
      })
    }
    if (lengthProperty) {
      syncProduct.attributes.push({
        attribute_id: 78,
        product_attribute_description: [
          {
            text: `${lengthProperty.value} cm`,
            language_code: 'ru-ru',
          },
          {
            text: `${lengthProperty.value} cm`,
            language_code: 'uk-ua',
          },
          {
            text: `${lengthProperty.value} cm`,
            language_code: 'pl',
          },
          {
            text: `${lengthProperty.value} cm`,
            language_code: 'en',
          },
          {
            text: `${lengthProperty.value} cm`,
            language_code: 'it',
          },
        ],
      })
    }
    if (isCurly) {
      syncProduct.attributes.push({
        attribute_id: 79,
        product_attribute_description: [
          {
            text: `Curly`,
            language_code: 'ru-ru',
          },
          {
            text: `Curly`,
            language_code: 'uk-ua',
          },
          {
            text: `Curly`,
            language_code: 'en',
          },
          {
            text: `Riccia`,
            language_code: 'it',
          },
          {
            text: `Kręcony`,
            language_code: 'pl',
          },
        ],
      })
    }
  }

  if (Object.keys(syncProduct).length === 0)
    return { status: 'success', code: 'NO_RELEVANT_CHANGES', message: 'No relevant fields to sync' }

  const apiUrl = buildUrl(
    site.url,
    '/index.php',
    {
      route: 'extension/remnant/remnant/editProduct',
      key: process.env.REMNANT_API_KEY || '',
    },
  )

  console.log('@@@@  6', syncProduct)

  try {
    const response = await axios.post(apiUrl, syncProduct, { headers: { 'Content-Type': 'application/json' } })

    await SyncEntryModel.updateOne({ sourceType: 'product', sourceId: productId, site: siteId }, {
      status: 'synced',
      syncedAt: new Date(),
      externalId: response.data.product_id,
      lastError: null,
    })
  }
  catch (error) {
    await SyncEntryModel.updateOne({ sourceType: 'product', sourceId: product.id, site: siteId }, {
      status: 'error',
      lastError: (error || '').toString(),
    })
  }

  return { status: 'success', code: 'SYNC_ENTRY_EDITED', message: 'Sync entry edited' }
}

export async function syncProductQuantity(payload: SyncEntryTypes.syncProductQuantityParams): Promise<SyncEntryTypes.syncProductQuantityResult> {
  const { siteId, productId } = payload

  const site = await SiteModel.findOne({ _id: siteId })

  if (!site)
    throw new HttpError(400, 'Site not found', 'SITE_NOT_FOUND')

  const syncEntry = await SyncEntryModel.findOne({ sourceType: 'product', sourceId: productId, site: siteId })

  if (!syncEntry)
    return { status: 'success', code: 'SYNC_ENTRY_NOT_FOUND', message: 'Sync entry not found' }

  const quantities = await QuantityModel.find({ product: productId, warehouse: { $in: site.warehouses } })

  if (quantities.length === 0)
    return { status: 'success', code: 'QUANTITY_NOT_FOUND', message: 'Quantity not found' }

  const quantity = quantities.reduce((acc, quantity) => acc + quantity.count, 0)

  const syncProduct: Record<string, any> = {
    external_id: productId,
    quantity,
  }

  const apiUrl = buildUrl(
    site.url,
    '/index.php',
    {
      route: 'extension/remnant/remnant/editProductQuantity',
      key: process.env.REMNANT_API_KEY || '',
    },
  )

  try {
    const response = await axios.post(apiUrl, syncProduct, { headers: { 'Content-Type': 'application/json' } })

    await SyncEntryModel.updateOne({ sourceType: 'product', sourceId: productId, site: siteId }, {
      status: 'synced',
      syncedAt: new Date(),
      externalId: response.data.product_id,
      lastError: null,
    })
  }
  catch (error) {
    await SyncEntryModel.updateOne({ sourceType: 'product', sourceId: productId, site: siteId }, {
      status: 'error',
      lastError: (error || '').toString(),
    })
  }

  return { status: 'success', code: 'SYNC_ENTRY_QUANTITY_EDITED', message: 'Sync entry quantity edited' }
}
