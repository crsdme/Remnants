import type {
  createProductPropertiesParams,
  editProductPropertyParams,
  getProductPropertiesParams,
  ProductPropertiesResponse,
  removeProductPropertiesParams,
} from '@/api/types/products-properties'
import { api } from '@/api/instance'

export async function getProductProperties(params: getProductPropertiesParams) {
  return api.get<ProductPropertiesResponse>('product-properties/get', { params })
}

export async function createProductProperty(params: createProductPropertiesParams) {
  return api.post<ProductPropertiesResponse>('product-properties/create', { ...params })
}

export async function editProductProperty(params: editProductPropertyParams) {
  return api.post<ProductPropertiesResponse>('product-properties/edit', params)
}

export async function removeProductProperties(params: removeProductPropertiesParams) {
  return api.post<ProductPropertiesResponse>('product-properties/remove', params)
}
