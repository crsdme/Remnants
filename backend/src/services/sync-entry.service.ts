import type { Minor } from '@remnant/shared'
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
import * as LanguageRepo from '@/repositories/language.repo'
import * as ProductPropertyOptionRepo from '@/repositories/product-property-option.repo'
import * as ProductRepo from '@/repositories/products.repo'
import * as QuantityRepo from '@/repositories/quantity.repo'
import * as SiteRepo from '@/repositories/site.repo'
import * as SyncEntryRepo from '@/repositories/sync-entry.repo'
import { HttpError } from '@/utils/httpError'
import { languageRecord } from '@/utils/language-record'
import logger from '@/utils/logger'
import { fromMinor } from '@/utils/money'

const RELEVANT_PRODUCT_FIELDS = ['names', 'minorPrice', 'currencyId', 'images', 'categoryIds', 'productProperties'] as const

function ok(code: string, message: string) {
  return {
    status: 'success' as const,
    code,
    message,
  }
}

function namesOverlap(a: Record<string, string>, b: Record<string, string>): boolean {
  for (const [code, name] of Object.entries(a)) {
    const other = b[code]
    if (name && other && name.trim().toLowerCase() === other.trim().toLowerCase())
      return true
  }
  return false
}

function linkExternalIds(link: { externalIds?: string[] | null } | null | undefined): string[] {
  if (link == null || !Array.isArray(link.externalIds))
    return []
  return link.externalIds.filter(id => typeof id === 'string' && id !== '')
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
      seo[code] = slugify(name, { lower: true, strict: true, locale: slugifyLocale(code) })
  }
  return seo
}

function slugifyLocale(code: string): string {
  const short = code.split('-')[0]?.toLowerCase() ?? ''
  return /^[a-z]{2}$/.test(short) ? short : 'en'
}

function hasRelevantDifference(difference: Record<string, unknown>): boolean {
  return RELEVANT_PRODUCT_FIELDS.some(key => Object.prototype.hasOwnProperty.call(difference, key))
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
    const body = await buildProductPayload(siteId, productId, site.warehouseIds ?? [], site.currencyId)
    const result = await remnantAdapter.createProduct(ctx, body)
    await markLink({
      siteId,
      sourceType: 'product',
      sourceId: productId,
      status: 'synced',
      externalIds: [String(result.productId)],
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
    const body = await buildProductPayload(siteId, productId, site.warehouseIds ?? [], site.currencyId)
    const result = await remnantAdapter.editProduct(ctx, body)
    await markLink({
      siteId,
      sourceType: 'product',
      sourceId: productId,
      status: 'synced',
      externalIds: [String(result.productId)],
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
  sourceType: 'product' | 'category' | 'attribute' | 'language'
  sourceId: string
  status: 'pending' | 'synced' | 'error'
  externalIds?: string[]
  lastError?: string | null
  syncedAt?: Date | null
}) {
  await SyncEntryRepo.upsertLink(payload)
}

async function buildProductPayload(
  siteId: string,
  productId: string,
  warehouseIds: string[],
  siteCurrencyId?: string | null,
): Promise<SiteProductPayload> {
  const product = await ProductRepo.findById(productId)
  if (product == null)
    throw new Error('Product not found')

  if (siteCurrencyId == null || siteCurrencyId === '')
    throw new Error('Site currency is not set')

  const languageMap = await loadSiteLanguageMap(siteId)
  const names = remapNames(languageMap, languageRecord(product.names))
  const categoryIds = await resolveSiteCategoryIds(siteId, product.categoryIds ?? [])
  const attributes = await resolveSiteAttributes(siteId, product.productProperties ?? [], languageMap)
  const quantity = await QuantityRepo.sumCountByProductAndWarehouses(productId, warehouseIds)
  const price = await convertProductPrice(product.minorPrice, product.currencyId, siteCurrencyId)

  return {
    remnantId: productId,
    names,
    price,
    quantity,
    categoryIds,
    attributes,
    images: (product.images ?? []).map(image => ({
      url: `${STORAGE_URLS.productImages}/${image.filename}`,
      name: image.name || image.filename,
    })),
    seo: toSeo(names),
  }
}

interface SiteLanguageMap {
  languages: Array<{ _id: string, code: string }>
  toExternal: Map<string, string>
}

async function loadSiteLanguageMap(siteId: string): Promise<SiteLanguageMap> {
  const languages = await LanguageRepo.listIdNames()
  const links = await SyncEntryRepo.findLinks(siteId, 'language', languages.map(item => item._id))
  const toExternal = new Map<string, string>()

  for (const language of languages) {
    const link = links.find(item => item.sourceId === language._id)
    const externalId = linkExternalIds(link)[0]
    if (externalId != null && externalId !== '')
      toExternal.set(language._id, externalId)
  }

  return { languages, toExternal }
}

function remapNames(languageMap: SiteLanguageMap, names: Record<string, string>): Record<string, string> {
  const remapped: Record<string, string> = {}

  for (const language of languageMap.languages) {
    const name = names[language.code]
    if (name == null || name === '')
      continue

    const externalId = languageMap.toExternal.get(language._id)
    if (externalId == null)
      throw new Error(`Language ${language.code} is not mapped for this site`)

    remapped[externalId] = name
  }

  return remapped
}

async function convertProductPrice(minorPrice: Minor, fromCurrencyId: string, toCurrencyId: string): Promise<number> {
  const fromCurrency = await CurrencyRepo.findOne({ _id: fromCurrencyId })
  const toCurrency = await CurrencyRepo.findOne({ _id: toCurrencyId })
  const fromScale = fromCurrency?.scale ?? 2
  const toScale = toCurrency?.scale ?? 2
  const major = Number.parseFloat(fromMinor(minorPrice, fromScale))

  if (fromCurrencyId === toCurrencyId)
    return major

  const { items } = await CurrencyRepo.listExchangeRates({
    filters: { fromCurrencyId, toCurrencyId },
    pagination: { current: 1, pageSize: 1, full: true },
    sorters: { createdAt: 'desc' },
  })

  if (items.length === 0)
    throw new Error(`Exchange rate not found from ${fromCurrencyId} to ${toCurrencyId}`)

  return Number.parseFloat((major * items[0].rate).toFixed(toScale))
}

async function resolveSiteCategoryIds(siteId: string, categoryIds: string[]): Promise<number[]> {
  if (categoryIds.length === 0)
    return []

  let links = await SyncEntryRepo.findLinks(siteId, 'category', categoryIds)
  const mapped = new Set(
    links
      .filter(link => linkExternalIds(link).length > 0)
      .map(link => link.sourceId),
  )
  const missing = categoryIds.filter(id => !mapped.has(id))

  if (missing.length > 0) {
    await matchCategoriesByName(siteId, missing)
    links = await SyncEntryRepo.findLinks(siteId, 'category', categoryIds)
  }

  const ids: number[] = []

  for (const categoryId of categoryIds) {
    const link = links.find(item => item.sourceId === categoryId)
    const externals = linkExternalIds(link)
    let found = false
    for (const externalId of externals) {
      const numeric = Number(externalId)
      if (Number.isFinite(numeric) && numeric > 0) {
        ids.push(numeric)
        found = true
      }
    }
    if (!found)
      logger.warn(`Category ${categoryId} is not mapped for site ${siteId}`)
  }

  return [...new Set(ids)]
}

async function resolveSiteAttributes(
  siteId: string,
  productProperties: Array<{ _id?: string, id?: string, value?: unknown }>,
  languageMap: SiteLanguageMap,
): Promise<Array<{ attributeId: number, text: Record<string, string> }>> {
  const propertyIds = productProperties
    .map(property => property._id ?? property.id)
    .filter((id): id is string => typeof id === 'string' && id !== '')

  if (propertyIds.length === 0)
    return []

  const links = await SyncEntryRepo.findLinks(siteId, 'attribute', propertyIds)
  const optionIds = collectOptionIds(productProperties.map(property => property.value))
  const options = await ProductPropertyOptionRepo.findByIds(optionIds)
  const optionNames = new Map(options.map(option => [option._id, languageRecord(option.names)]))
  const languageCodes = languageMap.languages.map(item => item.code)

  const attributes: Array<{ attributeId: number, text: Record<string, string> }> = []

  for (const property of productProperties) {
    const propertyId = property._id ?? property.id
    if (propertyId == null)
      continue

    const link = links.find(item => item.sourceId === propertyId)
    const externalId = linkExternalIds(link)[0]
    const numeric = externalId != null ? Number(externalId) : Number.NaN
    if (!Number.isFinite(numeric) || numeric <= 0)
      continue

    const text = remapNames(
      languageMap,
      formatPropertyValueByLanguage(property.value, optionNames, languageCodes),
    )
    if (Object.keys(text).length === 0)
      continue

    attributes.push({ attributeId: numeric, text })
  }

  return attributes
}

function collectOptionIds(values: unknown[]): string[] {
  const ids = new Set<string>()
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

  function walk(value: unknown) {
    if (typeof value === 'string' && uuid.test(value))
      ids.add(value)
    else if (Array.isArray(value))
      value.forEach(walk)
  }

  values.forEach(walk)
  return [...ids]
}

function formatPropertyValueByLanguage(
  value: unknown,
  optionNames: Map<string, Record<string, string>>,
  languageCodes: string[],
): Record<string, string> {
  if (value == null)
    return {}
  if (typeof value === 'boolean')
    return fillLanguageValues(value ? '1' : '0', languageCodes)
  if (typeof value === 'number')
    return fillLanguageValues(String(value), languageCodes)
  if (typeof value === 'string') {
    const names = optionNames.get(value)
    return names != null ? names : fillLanguageValues(value, languageCodes)
  }
  if (Array.isArray(value)) {
    const parts = value.map(item => formatPropertyValueByLanguage(item, optionNames, languageCodes))
    const joined: Record<string, string> = {}
    for (const code of languageCodes) {
      const text = parts
        .map(part => part[code] || Object.values(part)[0] || '')
        .filter(item => item !== '')
        .join(', ')
      if (text !== '')
        joined[code] = text
    }
    return joined
  }
  if (typeof value === 'object')
    return languageRecord(value)
  return fillLanguageValues(String(value), languageCodes)
}

function fillLanguageValues(text: string, languageCodes: string[]): Record<string, string> {
  const record: Record<string, string> = {}
  for (const code of languageCodes)
    record[code] = text
  return record
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
      externalIds: [String(match.id)],
      lastError: null,
      syncedAt: new Date(),
    })
  }
}
