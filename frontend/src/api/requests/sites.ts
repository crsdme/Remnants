import type {
  CreateSiteRequest,
  CreateSiteResponse,
  EditSiteRequest,
  EditSiteResponse,
  GetSitesRequest,
  GetSitesResponse,
  RemoveSitesRequest,
  RemoveSitesResponse,
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
