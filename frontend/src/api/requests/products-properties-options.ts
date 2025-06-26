import type {
  createProductPropertiesOptionParams,
  editProductPropertyOptionParams,
  getProductPropertiesOptionsParams,
  ProductPropertiesOptionsResponse,
  removeProductPropertyOptionParams,
} from '@/api/types'
import { api } from '@/api/instance'

export async function getProductPropertiesOptions(params: getProductPropertiesOptionsParams) {
  return api.get<ProductPropertiesOptionsResponse>('product-properties-options/get', { params })
}

export async function createProductPropertyOption(params: createProductPropertiesOptionParams) {
  return api.post<ProductPropertiesOptionsResponse>('product-properties-options/create', { ...params })
}

export async function editProductPropertyOption(params: editProductPropertyOptionParams) {
  return api.post<ProductPropertiesOptionsResponse>('product-properties-options/edit', params)
}

export async function removeProductPropertyOption(params: removeProductPropertyOptionParams) {
  return api.post<ProductPropertiesOptionsResponse>('product-properties-options/remove', params)
}
