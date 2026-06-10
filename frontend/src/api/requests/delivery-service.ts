import type {
  CreateDeliveryServiceRequest,
  CreateDeliveryServiceResponse,
  EditDeliveryServiceRequest,
  EditDeliveryServiceResponse,
  GetDeliveryServicesRequest,
  GetDeliveryServicesResponse,
  RemoveDeliveryServicesRequest,
  RemoveDeliveryServicesResponse,
} from '@remnant/shared'
import { api } from '@/api/instance'

export async function getDeliveryServices(params: GetDeliveryServicesRequest) {
  return api.get<GetDeliveryServicesResponse>('delivery-services/get', { params })
}

export async function createDeliveryService(params: CreateDeliveryServiceRequest) {
  return api.post<CreateDeliveryServiceResponse>('delivery-services/create', { ...params })
}

export async function editDeliveryService(params: EditDeliveryServiceRequest) {
  return api.post<EditDeliveryServiceResponse>('delivery-services/edit', params)
}

export async function removeDeliveryService(params: RemoveDeliveryServicesRequest) {
  return api.post<RemoveDeliveryServicesResponse>('delivery-services/remove', params)
}
