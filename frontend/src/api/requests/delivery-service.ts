import type {
  CreateDeliveryServiceRequest,
  CreateDeliveryServiceResponse,
  EditDeliveryServiceRequest,
  EditDeliveryServiceResponse,
  GetDeliveryCapabilitiesRequest,
  GetDeliveryCapabilitiesResponse,
  GetDeliveryLocationsRequest,
  GetDeliveryLocationsResponse,
  GetDeliveryServicesRequest,
  GetDeliveryServicesResponse,
  LookupDeliveryShipmentRequest,
  LookupDeliveryShipmentResponse,
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

export async function getDeliveryCapabilities(params: GetDeliveryCapabilitiesRequest) {
  return api.get<GetDeliveryCapabilitiesResponse>('delivery-services/capabilities/get', { params })
}

export async function getDeliveryLocations(params: GetDeliveryLocationsRequest) {
  return api.post<GetDeliveryLocationsResponse>('delivery-services/locations/get', params)
}

export async function lookupDeliveryShipment(params: LookupDeliveryShipmentRequest) {
  return api.post<LookupDeliveryShipmentResponse>('delivery-services/shipment/lookup', params)
}
