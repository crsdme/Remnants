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
    categories: [72],
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
