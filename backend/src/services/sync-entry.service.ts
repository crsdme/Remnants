import type { ClientSession } from 'mongoose'
import type { SiteContext, SiteProductPayload } from '@/integrations/site'
import type {
  CreateSyncEntryPayload,
  CreateSyncEntryResponse,
  EditSyncEntryPayload,
  EditSyncEntryResponse,
  GetSyncEntriesPayload,
  GetSyncEntriesResponse,
  RemoveSyncEntriesPayload,
  RemoveSyncEntriesResponse,
  SyncProductCreatePayload,
  SyncProductCreateResponse,
  SyncProductEditPayload,
  SyncProductEditResponse,
  SyncProductQuantityPayload,
  SyncProductQuantityResponse,
} from '@/types/'
import slugify from 'slugify'
import { STORAGE_URLS } from '@/config/constants'
import { remnantAdapter } from '@/integrations/site'
import { mapSyncEntryToDTO } from '@/mappers/'
import * as CategoryRepo from '@/repositories/categories.repo'
import * as CurrencyRepo from '@/repositories/currencies.repo'
import * as ProductRepo from '@/repositories/products.repo'
import * as QuantityRepo from '@/repositories/quantity.repo'
import * as SiteRepo from '@/repositories/site.repo'
import * as SyncEntryRepo from '@/repositories/sync-entry.repo'
import { HttpError } from '@/utils/httpError'
import logger from '@/utils/logger'
import { fromMinor } from '@/utils/money'

const RELEVANT_PRODUCT_FIELDS = ['names', 'minorPrice', 'currencyId', 'images', 'categoryIds'] as const

function ok(code: string, message: string) {
  return {
    status: 'success' as const,
    code,
    message,
  }
}

function languageRecord(value: unknown): Record<string, string> {
  if (value instanceof Map) {
    const record: Record<string, string> = {}
    for (const [key, name] of value.entries()) {
      if (typeof key === 'string' && typeof name === 'string')
        record[key] = name
    }
    return record
  }
  if (value != null && typeof value === 'object')
    return { ...(value as Record<string, string>) }
  return {}
}

function toSiteContext(site: { url?: string, key?: string }): SiteContext | null {
  const url = site.url?.trim() ?? ''
  const key = site.key?.trim() ?? ''
  if (url === '' || key === '')
    return null
  return { url, key }
}

function toSeo(names: Record<string, string>): Record<string, string> {
  const seo: Record<string, string> = {}
  for (const [code, name] of Object.entries(names)) {
    if (name)
      seo[code] = slugify(name, { lower: true, strict: true, locale: code })
  }
  return seo
}

function hasRelevantDifference(difference: Record<string, unknown>): boolean {
  return RELEVANT_PRODUCT_FIELDS.some(key => Object.prototype.hasOwnProperty.call(difference, key))
}

function namesOverlap(a: Record<string, string>, b: Record<string, string>): boolean {
  for (const [code, name] of Object.entries(a)) {
    const other = b[code]
    if (name && other && name.trim().toLowerCase() === other.trim().toLowerCase())
      return true
  }
  return false
}

export async function get(payload: GetSyncEntriesPayload): Promise<GetSyncEntriesResponse> {
  const { items, total, page, pageSize } = await SyncEntryRepo.list(payload)

  return {
    status: 'success',
    code: 'SYNC_ENTRIES_FETCHED',
    message: 'Sync entries fetched',
    data: {
      items,
      pagination: {
        page,
        pageSize,
        total,
      },
    },
  }
}

export async function create(payload: CreateSyncEntryPayload): Promise<CreateSyncEntryResponse> {
  const syncEntry = await SyncEntryRepo.createOne(payload)

  if (syncEntry === undefined)
    throw new HttpError(400, 'Sync entry not created', 'SYNC_ENTRY_NOT_CREATED')

  return {
    status: 'success',
    code: 'SYNC_ENTRY_CREATED',
    message: 'Sync entry created',
    data: mapSyncEntryToDTO(syncEntry),
  }
}

export async function edit(payload: EditSyncEntryPayload): Promise<EditSyncEntryResponse> {
  const syncEntry = await SyncEntryRepo.updateById(payload.id, payload)

  if (syncEntry === null)
    throw new HttpError(400, 'Sync entry not edited', 'SYNC_ENTRY_NOT_EDITED')

  return {
    status: 'success',
    code: 'SYNC_ENTRY_EDITED',
    message: 'Sync entry edited',
    data: mapSyncEntryToDTO(syncEntry),
  }
}

export async function remove(payload: RemoveSyncEntriesPayload): Promise<RemoveSyncEntriesResponse> {
  for (const id of payload.ids) {
    await SyncEntryRepo.removeById(id)
  }

  return {
    status: 'success',
    code: 'SYNC_ENTRIES_REMOVED',
    message: 'Sync entries removed',
  }
}

export async function syncProductCreate(payload: SyncProductCreatePayload): Promise<SyncProductCreateResponse> {
  const { siteId, productId } = payload
  const site = await SiteRepo.findById(siteId)

  if (site == null || site.removed === true || site.active !== true)
    return ok('SITE_SKIPPED', 'Site is missing or inactive')

  const ctx = toSiteContext(site)
  if (ctx == null) {
    await markLink({
      siteId,
      sourceType: 'product',
      sourceId: productId,
      status: 'error',
      lastError: 'Site url or key is empty',
    })
    return ok('SITE_SKIPPED', 'Site url or key is empty')
  }

  await markLink({
    siteId,
    sourceType: 'product',
    sourceId: productId,
    status: 'pending',
    lastError: null,
  })

  try {
    const body = await buildProductPayload(siteId, productId, site.warehouseIds ?? [])
    const result = await remnantAdapter.createProduct(ctx, body)
    await markLink({
      siteId,
      sourceType: 'product',
      sourceId: productId,
      status: 'synced',
      externalId: String(result.productId),
      lastError: null,
      syncedAt: new Date(),
    })
  }
  catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.error(`syncProductCreate failed site=${siteId} product=${productId}: ${message}`)
    await markLink({
      siteId,
      sourceType: 'product',
      sourceId: productId,
      status: 'error',
      lastError: message,
    })
  }

  return ok('SYNC_ENTRY_CREATED', 'Sync entry created')
}

export async function syncProductEdit(payload: SyncProductEditPayload): Promise<SyncProductEditResponse> {
  const { siteId, productId, difference } = payload
  const link = await SyncEntryRepo.findLink(siteId, 'product', productId)

  if (link == null)
    return syncProductCreate({ siteId, productId })

  if (!hasRelevantDifference(difference))
    return ok('NO_CHANGES', 'No changes to sync')

  const site = await SiteRepo.findById(siteId)
  if (site == null || site.removed === true || site.active !== true)
    return ok('SITE_SKIPPED', 'Site is missing or inactive')

  const ctx = toSiteContext(site)
  if (ctx == null) {
    await markLink({
      siteId,
      sourceType: 'product',
      sourceId: productId,
      status: 'error',
      lastError: 'Site url or key is empty',
    })
    return ok('SITE_SKIPPED', 'Site url or key is empty')
  }

  try {
    const body = await buildProductPayload(siteId, productId, site.warehouseIds ?? [])
    const result = await remnantAdapter.editProduct(ctx, body)
    await markLink({
      siteId,
      sourceType: 'product',
      sourceId: productId,
      status: 'synced',
      externalId: String(result.productId),
      lastError: null,
      syncedAt: new Date(),
    })
  }
  catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.error(`syncProductEdit failed site=${siteId} product=${productId}: ${message}`)
    await markLink({
      siteId,
      sourceType: 'product',
      sourceId: productId,
      status: 'error',
      lastError: message,
    })
  }

  return ok('SYNC_ENTRY_EDITED', 'Sync entry edited')
}

export async function syncProductQuantity(
  payload: SyncProductQuantityPayload,
  session?: ClientSession,
): Promise<SyncProductQuantityResponse> {
  const { siteId, productId } = payload
  const site = await SiteRepo.findById(siteId)

  if (site == null || site.removed === true || site.active !== true)
    return ok('SITE_SKIPPED', 'Site is missing or inactive')

  const link = await SyncEntryRepo.findLink(siteId, 'product', productId)
  if (link == null)
    return ok('SYNC_ENTRY_NOT_FOUND', 'Product is not linked to this site')

  const warehouseIds = site.warehouseIds ?? []
  if (warehouseIds.length === 0)
    return ok('SITE_SKIPPED', 'Site has no warehouses')

  const ctx = toSiteContext(site)
  if (ctx == null)
    return ok('SITE_SKIPPED', 'Site url or key is empty')

  const quantity = await QuantityRepo.sumCountByProductAndWarehouses(productId, warehouseIds, session)

  try {
    await remnantAdapter.editQuantity(ctx, { remnantId: productId, quantity })
    await markLink({
      siteId,
      sourceType: 'product',
      sourceId: productId,
      status: 'synced',
      lastError: null,
      syncedAt: new Date(),
    })
  }
  catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.error(`syncProductQuantity failed site=${siteId} product=${productId}: ${message}`)
    await markLink({
      siteId,
      sourceType: 'product',
      sourceId: productId,
      status: 'error',
      lastError: message,
    })
  }

  return ok('SYNC_ENTRY_QUANTITY_EDITED', 'Sync entry quantity edited')
}

export async function syncProductQuantityForWarehouse(payload: {
  productId: string
  warehouseId: string
  session?: ClientSession
}): Promise<void> {
  const sites = await SiteRepo.listActiveByWarehouseId(payload.warehouseId)

  for (const site of sites) {
    try {
      await syncProductQuantity({
        siteId: site._id,
        productId: payload.productId,
      }, payload.session)
    }
    catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      logger.error(`syncProductQuantityForWarehouse failed site=${site._id} product=${payload.productId}: ${message}`)
    }
  }
}

async function markLink(payload: {
  siteId: string
  sourceType: 'product' | 'category'
  sourceId: string
  status: 'pending' | 'synced' | 'error'
  externalId?: string | null
  lastError?: string | null
  syncedAt?: Date | null
}) {
  await SyncEntryRepo.upsertLink(payload)
}

async function buildProductPayload(
  siteId: string,
  productId: string,
  warehouseIds: string[],
): Promise<SiteProductPayload> {
  const product = await ProductRepo.findById(productId)
  if (product == null)
    throw new Error('Product not found')

  const currency = await CurrencyRepo.findOne({ _id: product.currencyId })
  const scale = currency?.scale ?? 2
  const names = languageRecord(product.names)
  const categoryIds = await resolveSiteCategoryIds(siteId, product.categoryIds ?? [])
  const quantity = await QuantityRepo.sumCountByProductAndWarehouses(productId, warehouseIds)

  return {
    remnantId: productId,
    names,
    price: Number.parseFloat(fromMinor(product.minorPrice, scale)),
    quantity,
    categoryIds,
    images: (product.images ?? []).map(image => ({
      url: `${STORAGE_URLS.productImages}/${image.filename}`,
      name: image.name || image.filename,
    })),
    seo: toSeo(names),
  }
}

async function resolveSiteCategoryIds(siteId: string, categoryIds: string[]): Promise<number[]> {
  if (categoryIds.length === 0)
    return []

  let links = await SyncEntryRepo.findLinks(siteId, 'category', categoryIds)
  const mapped = new Set(
    links
      .filter(link => typeof link.externalId === 'string' && link.externalId !== '')
      .map(link => link.sourceId),
  )
  const missing = categoryIds.filter(id => !mapped.has(id))

  if (missing.length > 0) {
    await matchCategoriesByName(siteId, missing)
    links = await SyncEntryRepo.findLinks(siteId, 'category', categoryIds)
  }

  const bySource = new Map(links.map(link => [link.sourceId, link.externalId]))
  const ids: number[] = []

  for (const categoryId of categoryIds) {
    const externalId = bySource.get(categoryId)
    const numeric = externalId != null && externalId !== '' ? Number(externalId) : Number.NaN
    if (Number.isFinite(numeric) && numeric > 0) {
      ids.push(numeric)
      continue
    }
    logger.warn(`Category ${categoryId} is not mapped for site ${siteId}`)
  }

  return ids
}

async function matchCategoriesByName(siteId: string, categoryIds: string[]): Promise<void> {
  const site = await SiteRepo.findById(siteId)
  const ctx = site != null ? toSiteContext(site) : null
  if (ctx == null)
    return

  const [siteCategories, crmCategories] = await Promise.all([
    remnantAdapter.listCategories(ctx),
    CategoryRepo.findByIds(categoryIds),
  ])

  for (const category of crmCategories) {
    const names = languageRecord(category.names)
    const match = siteCategories.find(siteCategory => namesOverlap(names, siteCategory.names))
    if (match == null)
      continue

    await markLink({
      siteId,
      sourceType: 'category',
      sourceId: category._id,
      status: 'synced',
      externalId: String(match.id),
      lastError: null,
      syncedAt: new Date(),
    })
  }
}
