import type {
  createSitesParams,
  editSitesParams,
  getSitesParams,
  removeSitesParams,
  SitesResponse,
} from '@/api/types'
import { api } from '@/api/instance'

export async function getSites(params: getSitesParams) {
  return api.get<SitesResponse>('sites/get', { params })
}

export async function createSite(params: createSitesParams) {
  return api.post<SitesResponse>('sites/create', { ...params })
}

export async function editSite(params: editSitesParams) {
  return api.post<SitesResponse>('sites/edit', params)
}

export async function removeSite(params: removeSitesParams) {
  return api.post<SitesResponse>('sites/remove', params)
}
