import type {
  CreateSiteResponse,
  EditSiteResponse,
  GetSitesResponse,
  RemoveSitesResponse,
} from '@remnant/shared'
import type {
  CreateSitePayload,
  EditSitePayload,
  GetSitesPayload,
  RemoveSitesPayload,
} from '@/types/'
import { mapSiteToDTO } from '@/mappers/'
import * as SiteRepo from '@/repositories/site.repo'
import { HttpError } from '@/utils/'

export async function get({ payload }: { payload: GetSitesPayload }): Promise<GetSitesResponse> {
  const { items, total, page, pageSize } = await SiteRepo.list(payload)

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
