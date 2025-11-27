import type {
  createProcurementsParams,
  editProcurementsParams,
  getProcurementItemsParams,
  getProcurementItemsResponse,
  getProcurementsParams,
  getProcurementsResponse,
  payProcurementParams,
  payProcurementResponse,
  removeProcurementsParams,
  scanBarcodeParams,
  scanBarcodeResponse,
} from '../types/procurement'
import { api } from '@/api/instance'

export async function getProcurements(params: getProcurementsParams) {
  return api.get<getProcurementsResponse>('procurements/get', { params })
}

export async function createProcurement(params: createProcurementsParams) {
  return api.post<getProcurementsResponse>('procurements/create', { ...params })
}

export async function editProcurement(params: editProcurementsParams) {
  return api.post<getProcurementsResponse>('procurements/edit', params)
}

export async function removeProcurement(params: removeProcurementsParams) {
  return api.post<getProcurementsResponse>('procurements/remove', params)
}

export async function getProcurementItems(params: getProcurementItemsParams) {
  return api.get<getProcurementItemsResponse>('procurements/get/items', { params })
}

export async function scanBarcode(params: scanBarcodeParams) {
  return api.get<scanBarcodeResponse>('procurements/scan/barcode', { params })
}

export async function payProcurement(params: payProcurementParams) {
  return api.post<payProcurementResponse>('procurements/pay', params)
}
