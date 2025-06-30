import type * as SyncEntryTypes from '../types/sync-entry.type'
import axios from 'axios'
import slugify from 'slugify'
import { STORAGE_URLS } from '../config/constants'
import { SyncEntryModel } from '../models'
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

export async function syncProductToSite(payload: SyncEntryTypes.syncProductToSiteParams): Promise<SyncEntryTypes.syncProductToSiteResult> {
  const { site, productId } = payload

  const syncEntry = await SyncEntryModel.findOne({ sourceType: 'product', sourceId: productId, site })

  if (!syncEntry) {
    await SyncEntryModel.create({ sourceType: 'product', sourceId: productId, site, status: 'pending' })
  }

  const { products: [product] } = await ProductService.get({
    filters: { ids: [productId] },
  })

  const weightProperty = product.productProperties.find(property => property.id === '7c3e2c1b-f2bf-4639-baf2-7b1101fa7bf2')
  const lengthProperty = product.productProperties.find(property => property.id === 'efcc3c51-a146-4975-bc5b-196745f76891')

  const syncProduct = {
    model: `REMNANT NEW PRODUCT`,
    external_id: productId,
    price: product.price * 1.18,
    translations: [
      {
        name: product.names.ru,
        url: slugify(product.names.ru || '', { lower: true }),
        language_code: 'ru-ru',
      },
      {
        name: product.names.en,
        url: slugify(product.names.en || '', { lower: true }),
        language_code: 'en-gb',
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
            language_code: 'en-gb',
          },
        ],
      },
      {
        attribute_id: 78,
        product_attribute_description: [
          {
            text: `${lengthProperty?.value} cm`,
            language_code: 'en-gb',
          },
        ],
      },
    ],
    // special: {
    //   price: product.price,
    // },
  }

  try {
    const response = await axios.post(
      `https://raw-hair-wholesale.com/index.php?route=extension/remnant/remnant/createProduct&key=${process.env.REMNANT_API_KEY}`,
      syncProduct,
      { headers: { 'Content-Type': 'application/json' } },
    )
    console.log(response.data)
    await SyncEntryModel.updateOne({ sourceType: 'product', sourceId: productId, site }, {
      status: 'synced',
      syncedAt: new Date(),
      externalId: response.data.product_id,
      lastError: null,
    })
  }
  catch (error) {
    await SyncEntryModel.updateOne({ sourceType: 'product', sourceId: product.id, site }, {
      status: 'error',
      lastError: (error || '').toString(),
    })
  }

  return { status: 'success', code: 'SYNC_ENTRY_CREATED', message: 'Sync entry created' }
}
