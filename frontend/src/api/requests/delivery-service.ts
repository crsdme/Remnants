import type {
  createDeliveryServicesParams,
  DeliveryServicesResponse,
  editDeliveryServicesParams,
  getDeliveryServicesParams,
  removeDeliveryServicesParams,
} from '@/api/types'
import { api } from '@/api/instance'

export async function getDeliveryServices(params: getDeliveryServicesParams) {
  return api.get<DeliveryServicesResponse>('delivery-services/get', { params })
}

export async function createDeliveryService(params: createDeliveryServicesParams) {
  return api.post<DeliveryServicesResponse>('delivery-services/create', { ...params })
}

export async function editDeliveryService(params: editDeliveryServicesParams) {
  return api.post<DeliveryServicesResponse>('delivery-services/edit', params)
}

export async function removeDeliveryService(params: removeDeliveryServicesParams) {
  return api.post<DeliveryServicesResponse>('delivery-services/remove', params)
}
