import type {
  createProductPropertiesGroupsParams,
  editProductPropertiesGroupsParams,
  getProductPropertiesGroupsParams,
  ProductPropertiesGroupsResponse,
  removeProductPropertiesGroupsParams,
} from '@/api/types'
import { api } from '@/api/instance'

export async function getProductPropertiesGroups(params: getProductPropertiesGroupsParams) {
  return api.get<ProductPropertiesGroupsResponse>('product-properties-groups/get', { params })
}

export async function createProductPropertiesGroups(params: createProductPropertiesGroupsParams) {
  return api.post<ProductPropertiesGroupsResponse>('product-properties-groups/create', { ...params })
}

export async function editProductPropertiesGroups(params: editProductPropertiesGroupsParams) {
  return api.post<ProductPropertiesGroupsResponse>('product-properties-groups/edit', params)
}

export async function removeProductPropertiesGroups(params: removeProductPropertiesGroupsParams) {
  return api.post<ProductPropertiesGroupsResponse>('product-properties-groups/remove', params)
}
