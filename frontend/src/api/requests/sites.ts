import type {
  CreateSiteRequest,
  CreateSiteResponse,
  EditSiteRequest,
  EditSiteResponse,
  GetSitesRequest,
  GetSitesResponse,
  GetSiteSyncMappingRequest,
  GetSiteSyncMappingResponse,
  GetSiteSyncSiteItemsRequest,
  GetSiteSyncSiteItemsResponse,
  RemoveSitesRequest,
  RemoveSitesResponse,
  SaveSiteSyncMappingRequest,
  SaveSiteSyncMappingResponse,
  SyncSiteProductsRequest,
  SyncSiteProductsResponse,
} from '@remnant/shared'
import { api } from '@/api/instance'

export async function getSites(params: GetSitesRequest) {
  return api.get<GetSitesResponse>('sites/get', { params })
}

export async function createSite(params: CreateSiteRequest) {
  return api.post<CreateSiteResponse>('sites/create', { ...params })
}

export async function editSite(params: EditSiteRequest) {
  return api.post<EditSiteResponse>('sites/edit', params)
}

export async function removeSite(params: RemoveSitesRequest) {
  return api.post<RemoveSitesResponse>('sites/remove', params)
}

export async function syncSiteProducts(params: SyncSiteProductsRequest) {
  return api.post<SyncSiteProductsResponse>('sites/sync-products', params, { timeout: 0 })
}

export async function getSiteSyncMapping(params: GetSiteSyncMappingRequest) {
  return api.get<GetSiteSyncMappingResponse>('sites/sync-mapping', { params })
}

export async function getSiteSyncSiteItems(params: GetSiteSyncSiteItemsRequest) {
  const ids = params.ids
  return api.get<GetSiteSyncSiteItemsResponse>('sites/sync-site-items', {
    params: {
      id: params.id,
      sourceType: params.sourceType,
      query: params.query,
      ids: Array.isArray(ids) ? ids.join(',') : ids,
    },
  })
}

export async function saveSiteSyncMapping(params: SaveSiteSyncMappingRequest) {
  return api.post<SaveSiteSyncMappingResponse>('sites/sync-mapping', params)
}
