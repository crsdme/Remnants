import type {
  CreateOrderStatusRequest,
  CreateOrderStatusResponse,
  EditOrderStatusRequest,
  EditOrderStatusResponse,
  GetOrderStatusesRequest,
  GetOrderStatusesResponse,
  RemoveOrderStatusesRequest,
  RemoveOrderStatusesResponse,
} from '@remnant/shared'
import { api } from '@/api/instance'

export async function getOrderStatuses(params: GetOrderStatusesRequest) {
  return api.get<GetOrderStatusesResponse>('order-statuses/get', { params })
}

export async function createOrderStatus(params: CreateOrderStatusRequest) {
  return api.post<CreateOrderStatusResponse>('order-statuses/create', { ...params })
}

export async function editOrderStatus(params: EditOrderStatusRequest) {
  return api.post<EditOrderStatusResponse>('order-statuses/edit', params)
}

export async function removeOrderStatus(params: RemoveOrderStatusesRequest) {
  return api.post<RemoveOrderStatusesResponse>('order-statuses/remove', params)
}
