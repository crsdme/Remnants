import type {
  CreateProductPropertyRequest,
  CreateProductPropertyResponse,
  EditProductPropertyRequest,
  EditProductPropertyResponse,
  GetProductPropertiesResponse,
  GetProductPropertyRequest,
  RemoveProductPropertiesResponse,
  RemoveProductPropertyRequest,
} from '@remnant/shared'
import { api } from '@/api/instance'

export async function getProductProperties(params: GetProductPropertyRequest) {
  return api.get<GetProductPropertiesResponse>('product-properties/get', { params })
}

export async function createProductProperty(params: CreateProductPropertyRequest) {
  return api.post<CreateProductPropertyResponse>('product-properties/create', { ...params })
}

export async function editProductProperty(params: EditProductPropertyRequest) {
  return api.post<EditProductPropertyResponse>('product-properties/edit', params)
}

export async function removeProductProperties(params: RemoveProductPropertyRequest) {
  return api.post<RemoveProductPropertiesResponse>('product-properties/remove', params)
}
