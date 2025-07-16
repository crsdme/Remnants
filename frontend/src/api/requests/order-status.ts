import type {
  createOrderStatusesParams,
  editOrderStatusesParams,
  getOrderStatusesParams,
  OrderStatusesResponse,
  removeOrderStatusesParams,
} from '@/api/types'
import { api } from '@/api/instance'

export async function getOrderStatuses(params: getOrderStatusesParams) {
  return api.get<OrderStatusesResponse>('order-statuses/get', { params })
}

export async function createOrderStatus(params: createOrderStatusesParams) {
  return api.post<OrderStatusesResponse>('order-statuses/create', { ...params })
}

export async function editOrderStatus(params: editOrderStatusesParams) {
  return api.post<OrderStatusesResponse>('order-statuses/edit', params)
}

export async function removeOrderStatus(params: removeOrderStatusesParams) {
  return api.post<OrderStatusesResponse>('order-statuses/remove', params)
}
