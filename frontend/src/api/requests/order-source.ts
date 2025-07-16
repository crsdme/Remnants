import type {
  createOrderSourcesParams,
  editOrderSourcesParams,
  getOrderSourcesParams,
  OrderSourcesResponse,
  removeOrderSourcesParams,
} from '@/api/types'
import { api } from '@/api/instance'

export async function getOrderSources(params: getOrderSourcesParams) {
  return api.get<OrderSourcesResponse>('order-sources/get', { params })
}

export async function createOrderSource(params: createOrderSourcesParams) {
  return api.post<OrderSourcesResponse>('order-sources/create', { ...params })
}

export async function editOrderSource(params: editOrderSourcesParams) {
  return api.post<OrderSourcesResponse>('order-sources/edit', params)
}

export async function removeOrderSource(params: removeOrderSourcesParams) {
  return api.post<OrderSourcesResponse>('order-sources/remove', params)
}
