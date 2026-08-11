import type {
  CreateProductStockStatusRequest,
  CreateProductStockStatusResponse,
  EditProductStockStatusRequest,
  EditProductStockStatusResponse,
  GetProductStockStatusesRequest,
  GetProductStockStatusesResponse,
  RemoveProductStockStatusesRequest,
  RemoveProductStockStatusesResponse,
} from '@remnant/shared'
import { api } from '@/api/instance'

export async function getProductStockStatuses(params: GetProductStockStatusesRequest) {
  return api.get<GetProductStockStatusesResponse>('product-stock-statuses/get', { params })
}

export async function createProductStockStatus(params: CreateProductStockStatusRequest) {
  return api.post<CreateProductStockStatusResponse>('product-stock-statuses/create', { ...params })
}

export async function editProductStockStatus(params: EditProductStockStatusRequest) {
  return api.post<EditProductStockStatusResponse>('product-stock-statuses/edit', params)
}

export async function removeProductStockStatus(params: RemoveProductStockStatusesRequest) {
  return api.post<RemoveProductStockStatusesResponse>('product-stock-statuses/remove', params)
}
