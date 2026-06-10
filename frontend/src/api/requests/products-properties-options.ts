import type {
  CreateProductPropertyOptionRequest,
  CreateProductPropertyOptionResponse,
  EditProductPropertyOptionRequest,
  EditProductPropertyOptionResponse,
  GetProductPropertyOptionRequest,
  GetProductPropertyOptionsResponse,
  RemoveProductPropertyOptionRequest,
  RemoveProductPropertyOptionsResponse,
} from '@remnant/shared'
import { api } from '@/api/instance'

export async function getProductPropertiesOptions(params: GetProductPropertyOptionRequest) {
  return api.get<GetProductPropertyOptionsResponse>('product-properties-options/get', { params })
}

export async function createProductPropertyOption(params: CreateProductPropertyOptionRequest) {
  return api.post<CreateProductPropertyOptionResponse>('product-properties-options/create', { ...params })
}

export async function editProductPropertyOption(params: EditProductPropertyOptionRequest) {
  return api.post<EditProductPropertyOptionResponse>('product-properties-options/edit', params)
}

export async function removeProductPropertyOption(params: RemoveProductPropertyOptionRequest) {
  return api.post<RemoveProductPropertyOptionsResponse>('product-properties-options/remove', params)
}
