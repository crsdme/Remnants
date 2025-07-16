import type {
  createDeliveryStatusesParams,
  DeliveryStatusesResponse,
  editDeliveryStatusesParams,
  getDeliveryStatusesParams,
  removeDeliveryStatusesParams,
} from '@/api/types'
import { api } from '@/api/instance'

export async function getDeliveryStatuses(params: getDeliveryStatusesParams) {
  return api.get<DeliveryStatusesResponse>('delivery-statuses/get', { params })
}

export async function createDeliveryStatus(params: createDeliveryStatusesParams) {
  return api.post<DeliveryStatusesResponse>('delivery-statuses/create', { ...params })
}

export async function editDeliveryStatus(params: editDeliveryStatusesParams) {
  return api.post<DeliveryStatusesResponse>('delivery-statuses/edit', params)
}

export async function removeDeliveryStatus(params: removeDeliveryStatusesParams) {
  return api.post<DeliveryStatusesResponse>('delivery-statuses/remove', params)
}
