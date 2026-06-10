import type {
  CreateProcurementRequest,
  CreateProcurementResponse,
  EditProcurementRequest,
  EditProcurementResponse,
  GetProcurementItemsRequest,
  GetProcurementItemsResponse,
  GetProcurementsRequest,
  GetProcurementsResponse,
  PayProcurementRequest,
  PayProcurementResponse,
  RemoveProcurementsRequest,
  RemoveProcurementsResponse,
  ScanBarcodeProcurementRequest,
  ScanBarcodeToDraftResponse,
} from '@remnant/shared'
import { api } from '@/api/instance'

export async function getProcurements(params: GetProcurementsRequest) {
  return api.get<GetProcurementsResponse>('procurements/get', { params })
}

export async function createProcurement(params: CreateProcurementRequest) {
  return api.post<CreateProcurementResponse>('procurements/create', { ...params })
}

export async function editProcurement(params: EditProcurementRequest) {
  return api.post<EditProcurementResponse>('procurements/edit', params)
}

export async function removeProcurement(params: RemoveProcurementsRequest) {
  return api.post<RemoveProcurementsResponse>('procurements/remove', params)
}

export async function getProcurementItems(params: GetProcurementItemsRequest) {
  return api.get<GetProcurementItemsResponse>('procurements/get/items', { params })
}

export async function scanBarcode(params: ScanBarcodeProcurementRequest) {
  return api.get<ScanBarcodeToDraftResponse>('procurements/scan/barcode', { params })
}

export async function payProcurement(params: PayProcurementRequest) {
  return api.post<PayProcurementResponse>('procurements/pay', params)
}
