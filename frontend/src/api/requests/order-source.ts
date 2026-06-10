import type {
  CreateOrderSourceRequest,
  CreateOrderSourceResponse,
  EditOrderSourceRequest,
  EditOrderSourceResponse,
  GetOrderSourcesRequest,
  GetOrderSourcesResponse,
  RemoveOrderSourcesRequest,
  RemoveOrderSourcesResponse,
} from '@remnant/shared'
import { api } from '@/api/instance'

export async function getOrderSources(params: GetOrderSourcesRequest) {
  return api.get<GetOrderSourcesResponse>('order-sources/get', { params })
}

export async function createOrderSource(params: CreateOrderSourceRequest) {
  return api.post<CreateOrderSourceResponse>('order-sources/create', { ...params })
}

export async function editOrderSource(params: EditOrderSourceRequest) {
  return api.post<EditOrderSourceResponse>('order-sources/edit', params)
}

export async function removeOrderSource(params: RemoveOrderSourcesRequest) {
  return api.post<RemoveOrderSourcesResponse>('order-sources/remove', params)
}
