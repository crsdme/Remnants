import type {
  BarcodesResponse,
  createBarcodesParams,
  editBarcodeParams,
  getBarcodesParams,
  removeBarcodesParams,
} from '@/api/types/barcodes'
import { api } from '@/api/instance'

export async function getBarcodes(params: getBarcodesParams) {
  return api.get<BarcodesResponse>('barcodes/get', { params })
}

export async function createBarcode(params: createBarcodesParams) {
  return api.post<BarcodesResponse>('barcodes/create', { ...params })
}

export async function editBarcode(params: editBarcodeParams) {
  return api.post<BarcodesResponse>('barcodes/edit', params)
}

export async function removeBarcodes(params: removeBarcodesParams) {
  return api.post<BarcodesResponse>('barcodes/remove', params)
}

export async function generateCode() {
  return api.get<BarcodesResponse>('barcodes/generate-code')
}
