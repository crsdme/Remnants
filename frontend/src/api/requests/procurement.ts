import type {
  CancelProcurementPaymentRequest,
  CancelProcurementPaymentResponse,
  ConfirmProcurementRequest,
  ConfirmProcurementResponse,
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
  PaySupplierRequest,
  PaySupplierResponse,
  RemoveProcurementsRequest,
  RemoveProcurementsResponse,
  ScanBarcodeProcurementRequest,
  ScanBarcodeProcurementResponse,
  UnconfirmProcurementRequest,
  UnconfirmProcurementResponse,
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
  return api.get<ScanBarcodeProcurementResponse>('procurements/scan/barcode', { params })
}

export async function payProcurement(params: PayProcurementRequest) {
  return api.post<PayProcurementResponse>('procurements/pay', params)
}

export async function confirmProcurement(params: ConfirmProcurementRequest) {
  return api.post<ConfirmProcurementResponse>('procurements/confirm', params)
}

export async function unconfirmProcurement(params: UnconfirmProcurementRequest) {
  return api.post<UnconfirmProcurementResponse>('procurements/unconfirm', params)
}

export async function cancelProcurementPayment(params: CancelProcurementPaymentRequest) {
  return api.post<CancelProcurementPaymentResponse>('procurements/pay/cancel', params)
}

export async function paySupplier(params: PaySupplierRequest) {
  return api.post<PaySupplierResponse>('procurements/pay/supplier', params)
}
