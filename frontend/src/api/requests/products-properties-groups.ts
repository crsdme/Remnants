import type {
  CreateProductPropertyGroupRequest,
  CreateProductPropertyGroupResponse,
  EditProductPropertyGroupRequest,
  EditProductPropertyGroupResponse,
  GetProductPropertyGroupRequest,
  GetProductPropertyGroupsResponse,
  RemoveProductPropertyGroupRequest,
  RemoveProductPropertyGroupsResponse,
} from '@remnant/shared'
import { api } from '@/api/instance'

export async function getProductPropertyGroups(params: GetProductPropertyGroupRequest) {
  return api.get<GetProductPropertyGroupsResponse>('product-properties-groups/get', { params })
}

export async function createProductPropertyGroups(params: CreateProductPropertyGroupRequest) {
  return api.post<CreateProductPropertyGroupResponse>('product-properties-groups/create', { ...params })
}

export async function editProductPropertyGroups(params: EditProductPropertyGroupRequest) {
  return api.post<EditProductPropertyGroupResponse>('product-properties-groups/edit', params)
}

export async function removeProductPropertyGroups(params: RemoveProductPropertyGroupRequest) {
  return api.post<RemoveProductPropertyGroupsResponse>('product-properties-groups/remove', params)
}
