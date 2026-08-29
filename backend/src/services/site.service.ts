import type {
  AuthUser,
  CreateSiteResponse,
  EditSiteResponse,
  GetSitesResponse,
  GetSiteSyncMappingResponse,
  GetSiteSyncSiteItemsResponse,
  RemoveSitesResponse,
  SaveSiteSyncMappingResponse,
  SyncSiteProductsResponse,
} from '@remnant/shared'
import type { SiteContext } from '@/integrations/site'
import type {
  CreateSitePayload,
  EditSitePayload,
  GetSitesPayload,
  GetSiteSyncMappingPayload,
  GetSiteSyncSiteItemsPayload,
  RemoveSitesPayload,
  SaveSiteSyncMappingPayload,
  SyncSiteProductsPayload,
} from '@/types/'
import { remnantAdapter, SiteSyncError } from '@/integrations/site'
import { mapSiteToDTO } from '@/mappers/'
import * as CategoryRepo from '@/repositories/categories.repo'
import * as LanguageRepo from '@/repositories/language.repo'
import * as ProductPropertyRepo from '@/repositories/product-property.repo'
import * as ProductRepo from '@/repositories/products.repo'
import * as SiteRepo from '@/repositories/site.repo'
import * as SyncEntryRepo from '@/repositories/sync-entry.repo'
import * as UserAccessRepo from '@/repositories/user-access.repo'
import * as SyncEntryService from '@/services/sync-entry.service'
import { getScopeIdsForUser, HttpError } from '@/utils/'
import { languageRecord } from '@/utils/language-record'

export async function get({
  payload,
  user,
}: {
  payload: GetSitesPayload
  user: AuthUser
}): Promise<GetSitesResponse> {
  const access = await UserAccessRepo.getScopesByUserId(user.id)
  const scopeIds = getScopeIdsForUser(access, 'siteIds', user)

  const { items, total, page, pageSize } = await SiteRepo.list(payload, { scopeIds })

  return {
    status: 'success',
    code: 'SITES_FETCHED',
    message: 'Sites fetched',
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

export async function create({ payload }: { payload: CreateSitePayload }): Promise<CreateSiteResponse> {
  const site = await SiteRepo.createOne(payload)

  return {
    status: 'success',
    code: 'SITE_CREATED',
    message: 'Site created',
    data: mapSiteToDTO(site),
  }
}

export async function edit({ payload }: { payload: EditSitePayload }): Promise<EditSiteResponse> {
  const { id } = payload

  const site = await SiteRepo.updateById(id, payload)

  if (site === null)
    throw new HttpError(400, 'Site not edited', 'SITE_NOT_EDITED')

  return {
    status: 'success',
    code: 'SITE_EDITED',
    message: 'Site edited',
    data: mapSiteToDTO(site),
  }
}

export async function remove({ payload }: { payload: RemoveSitesPayload }): Promise<RemoveSitesResponse> {
  for (const id of payload.ids) {
    const site = await SiteRepo.removeById(id)
    if (site === null)
      throw new HttpError(400, 'Sites not removed', 'SITES_NOT_REMOVED')
  }

  return {
    status: 'success',
    code: 'SITES_REMOVED',
    message: 'Sites removed',
  }
}

export async function syncProducts({ payload }: { payload: SyncSiteProductsPayload }): Promise<SyncSiteProductsResponse> {
  const site = await SiteRepo.findById(payload.id)

  if (site == null || site.removed === true)
    throw new HttpError(404, 'Site not found', 'SITE_NOT_FOUND')

  if (site.active !== true)
    throw new HttpError(400, 'Site is inactive', 'SITE_INACTIVE')

  if ((site.url ?? '').trim() === '' || (site.key ?? '').trim() === '')
    throw new HttpError(400, 'Site url or key is empty', 'SITE_SYNC_NOT_CONFIGURED')

  const ctx = toSiteContext(site)
  if (ctx == null)
    throw new HttpError(400, 'Site url or key is empty', 'SITE_SYNC_NOT_CONFIGURED')

  await remnantAdapter.ping(ctx).catch((error: unknown) => throwSiteCatalogError(error))
  await assertLanguagesMapped(site._id)

  const productIds = await ProductRepo.listIds()
  let synced = 0
  let failed = 0

  for (const productId of productIds) {
    await SyncEntryService.syncProductCreate({
      siteId: site._id,
      productId,
    })

    const link = await SyncEntryRepo.findLink(site._id, 'product', productId)
    if (link?.status === 'synced')
      synced += 1
    else
      failed += 1
  }

  return {
    status: 'success',
    code: 'SITE_PRODUCTS_SYNCED',
    message: 'Site products synced',
    data: {
      total: productIds.length,
      synced,
      failed,
    },
  }
}

function toSiteContext(site: { url?: string, key?: string }): SiteContext | null {
  const url = site.url?.trim() ?? ''
  const key = site.key?.trim() ?? ''
  if (url === '' || key === '')
    return null
  return { url, key }
}

function linkExternalIds(link: { externalIds?: string[] | null } | null | undefined): string[] {
  if (link == null || !Array.isArray(link.externalIds))
    return []
  return link.externalIds.filter(id => typeof id === 'string' && id !== '')
}

async function requireConfiguredSite(id: string) {
  const site = await SiteRepo.findById(id)
  if (site == null || site.removed === true)
    throw new HttpError(404, 'Site not found', 'SITE_NOT_FOUND')

  const ctx = toSiteContext(site)
  if (ctx == null)
    throw new HttpError(400, 'Site url or key is empty', 'SITE_SYNC_NOT_CONFIGURED')

  await remnantAdapter.ping(ctx).catch((error: unknown) => throwSiteCatalogError(error))

  return { site, ctx }
}

export async function getSyncMapping({ payload }: { payload: GetSiteSyncMappingPayload }): Promise<GetSiteSyncMappingResponse> {
  const { site, ctx } = await requireConfiguredSite(payload.id)
  const { current, pageSize, full } = payload.pagination
  const sourceType = payload.sourceType

  const siteItemsRaw = sourceType === 'product'
    ? []
    : await listSiteItems(ctx, sourceType).catch((error: unknown) => throwSiteCatalogError(error))

  const [crm, links] = await Promise.all([
    listCrmItems(sourceType, {
      current,
      pageSize,
      full: full === true || sourceType !== 'product',
      names: payload.names,
    }),
    SyncEntryRepo.findLinksByType(site._id, sourceType),
  ])

  return {
    status: 'success',
    code: 'SITE_SYNC_MAPPING_FETCHED',
    message: 'Site sync mapping fetched',
    data: {
      crmItems: crm.items.map(item => ({
        id: String(item.id),
        names: languageRecord(item.names),
      })),
      siteItems: siteItemsRaw.map(item => toSyncSiteItem(item)),
      links: links.map(link => ({
        sourceId: link.sourceId,
        externalIds: linkExternalIds(link),
      })),
      pagination: {
        page: current,
        pageSize,
        total: crm.total,
      },
    },
  }
}

export async function getSyncSiteItems({ payload }: { payload: GetSiteSyncSiteItemsPayload }): Promise<GetSiteSyncSiteItemsResponse> {
  const { ctx } = await requireConfiguredSite(payload.id)
  const items = await listSiteSearchItems(ctx, payload).catch((error: unknown) => throwSiteCatalogError(error))

  return {
    status: 'success',
    code: 'SITE_SYNC_SITE_ITEMS_FETCHED',
    message: 'Site catalog items fetched',
    data: { items },
  }
}

export async function saveSyncMapping({ payload }: { payload: SaveSiteSyncMappingPayload }): Promise<SaveSiteSyncMappingResponse> {
  const { site, ctx } = await requireConfiguredSite(payload.id)
  const externalIds = uniqueExternalIds(payload.sourceType, payload.externalIds)

  if (payload.sourceType === 'product') {
    try {
      if (externalIds.length === 1) {
        await remnantAdapter.linkProduct(ctx, {
          remnantId: payload.sourceId,
          productId: Number(externalIds[0]),
        })
      }
      else {
        await remnantAdapter.unlinkProduct(ctx, { remnantId: payload.sourceId })
      }
    }
    catch (error: unknown) {
      throwSiteCatalogError(error)
    }
  }

  await SyncEntryRepo.upsertLink({
    siteId: site._id,
    sourceType: payload.sourceType,
    sourceId: payload.sourceId,
    externalIds,
    status: externalIds.length > 0 ? 'synced' : 'pending',
    lastError: null,
    syncedAt: externalIds.length > 0 ? new Date() : null,
  })

  return {
    status: 'success',
    code: 'SITE_SYNC_MAPPING_SAVED',
    message: 'Site sync mapping saved',
    data: {
      sourceId: payload.sourceId,
      externalIds,
    },
  }
}

function uniqueExternalIds(sourceType: SaveSiteSyncMappingPayload['sourceType'], ids: string[]): string[] {
  const cleaned = [...new Set(ids.map(id => id.trim()).filter(id => id !== ''))]
  if (sourceType === 'category')
    return cleaned
  return cleaned.slice(0, 1)
}

async function listCrmItems(
  sourceType: GetSiteSyncMappingPayload['sourceType'],
  pagination: { current: number, pageSize: number, full?: boolean, names?: string },
) {
  if (sourceType === 'product') {
    const { items, total } = await ProductRepo.listIdNames(pagination)
    return {
      items: items.map(item => ({ id: item._id, names: languageRecord(item.names) })),
      total,
    }
  }

  if (sourceType === 'category') {
    const items = await CategoryRepo.listIdNames()
    return {
      items: items.map(item => ({ id: item._id, names: languageRecord(item.names) })),
      total: items.length,
    }
  }

  if (sourceType === 'language') {
    const items = await LanguageRepo.listIdNames()
    return {
      items: items.map(item => ({ id: item._id, names: item.names })),
      total: items.length,
    }
  }

  const items = await ProductPropertyRepo.listIdNames()
  return {
    items: items.map(item => ({ id: item._id, names: languageRecord(item.names) })),
    total: items.length,
  }
}

async function listSiteItems(ctx: SiteContext, sourceType: GetSiteSyncMappingPayload['sourceType']) {
  if (sourceType === 'product')
    return remnantAdapter.listProducts(ctx)
  if (sourceType === 'category')
    return remnantAdapter.listCategories(ctx)
  if (sourceType === 'language')
    return remnantAdapter.listLanguages(ctx)
  return remnantAdapter.listAttributes(ctx)
}

function toSyncSiteItem(item: { id: number | string, names?: unknown, parentId?: number | string | null }) {
  const parentId = item.parentId != null && Number(item.parentId) > 0 ? String(item.parentId) : undefined
  return {
    id: String(item.id),
    names: languageRecord(item.names),
    ...(parentId !== undefined ? { parentId } : {}),
  }
}

function siteItemMatches(
  item: { id: string, names: Record<string, string> },
  needle: string,
  path = '',
) {
  const query = needle.toLowerCase()
  if (item.id === needle || item.id.toLowerCase().includes(query))
    return true
  if (Object.values(item.names).some(name => name.toLowerCase().includes(query)))
    return true
  return path.toLowerCase().includes(query)
}

function categoryPath(
  item: { id: string, parentId?: string, names: Record<string, string> },
  byId: Map<string, { id: string, parentId?: string, names: Record<string, string> }>,
) {
  const parts: string[] = []
  const seen = new Set<string>()
  let current: typeof item | undefined = item
  while (current != null && !seen.has(current.id)) {
    seen.add(current.id)
    const name = current.names.ru || current.names.en || Object.values(current.names)[0] || ''
    if (name !== '')
      parts.unshift(name)
    current = current.parentId != null && current.parentId !== ''
      ? byId.get(current.parentId)
      : undefined
  }
  return parts.join(' / ')
}

async function listSiteSearchItems(ctx: SiteContext, payload: GetSiteSyncSiteItemsPayload) {
  const ids = payload.ids ?? []
  const query = payload.query?.trim() ?? ''

  if (payload.sourceType === 'product') {
    const raw = await remnantAdapter.listProducts(ctx, {
      query: ids.length > 0 ? undefined : query,
      ids: ids.length > 0 ? ids : undefined,
      limit: ids.length > 0 ? Math.min(Math.max(ids.length, 1), 100) : 50,
    })
    return raw.map(item => toSyncSiteItem(item))
  }

  const raw = payload.sourceType === 'category'
    ? await remnantAdapter.listCategories(ctx)
    : payload.sourceType === 'language'
      ? await remnantAdapter.listLanguages(ctx)
      : await remnantAdapter.listAttributes(ctx)
  const items = raw.map(item => toSyncSiteItem(item))

  if (ids.length > 0)
    return items.filter(item => ids.includes(item.id))

  if (query === '')
    return items

  if (payload.sourceType !== 'category')
    return items.filter(item => siteItemMatches(item, query))

  const byId = new Map(items.map(item => [item.id, item]))
  return items.filter(item => siteItemMatches(item, query, categoryPath(item, byId)))
}

function throwSiteCatalogError(error: unknown): never {
  if (error instanceof SiteSyncError) {
    const code = error.outdated || error.status === 404 || error.status === 405
      ? 'SITE_MODULE_OUTDATED'
      : 'SITE_SYNC_FAILED'
    throw new HttpError(502, error.message, code)
  }
  throw error
}

async function assertLanguagesMapped(siteId: string) {
  const languages = await LanguageRepo.listIdNames()
  if (languages.length === 0)
    return

  const links = await SyncEntryRepo.findLinks(siteId, 'language', languages.map(item => item._id))
  const missing = languages.some((language) => {
    const link = links.find(item => item.sourceId === language._id)
    return linkExternalIds(link).length === 0
  })

  if (missing)
    throw new HttpError(400, 'Site languages are not mapped', 'SITE_LANGUAGES_NOT_MAPPED')
}
