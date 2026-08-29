import type {
  AuthUser,
  CreateSiteResponse,
  EditSiteResponse,
  GetSitesResponse,
  RemoveSitesResponse,
  SyncSiteProductsResponse,
} from '@remnant/shared'
import type {
  CreateSitePayload,
  EditSitePayload,
  GetSitesPayload,
  RemoveSitesPayload,
  SyncSiteProductsPayload,
} from '@/types/'
import { mapSiteToDTO } from '@/mappers/'
import * as ProductRepo from '@/repositories/products.repo'
import * as SiteRepo from '@/repositories/site.repo'
import * as SyncEntryRepo from '@/repositories/sync-entry.repo'
import * as UserAccessRepo from '@/repositories/user-access.repo'
import * as SyncEntryService from '@/services/sync-entry.service'
import { getScopeIdsForUser, HttpError } from '@/utils/'

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
