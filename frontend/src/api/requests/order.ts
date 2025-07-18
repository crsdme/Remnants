import type {
  createOrderParams,
  editOrderParams,
  getOrdersParams,
  OrderResponse,
  removeOrdersParams,
} from '@/api/types'
import { api } from '@/api/instance'

export async function getOrders(params: getOrdersParams) {
  return api.get<OrderResponse>('orders/get', { params })
}

export async function createOrder(params: createOrderParams) {
  return api.post<OrderResponse>('orders/create', { ...params })
}

export async function editOrder(params: editOrderParams) {
  return api.post<OrderResponse>('orders/edit', params)
}

export async function removeOrder(params: removeOrdersParams) {
  return api.post<OrderResponse>('orders/remove', params)
}
