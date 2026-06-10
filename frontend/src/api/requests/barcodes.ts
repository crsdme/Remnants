import type {
  CreateBarcodeRequest,
  CreateBarcodeResponse,
  EditBarcodeRequest,
  EditBarcodeResponse,
  GenerateCodeResponse,
  GetBarcodeByCodeRequest,
  GetBarcodeByCodeResponse,
  GetBarcodesRequest,
  GetBarcodesResponse,
  RemoveBarcodesRequest,
  RemoveBarcodesResponse,
} from '@remnant/shared'
import { api } from '@/api/instance'

export async function getBarcodes(params: GetBarcodesRequest) {
  return api.get<GetBarcodesResponse>('barcodes/get', { params })
}

export async function createBarcode(params: CreateBarcodeRequest) {
  return api.post<CreateBarcodeResponse>('barcodes/create', { ...params })
}

export async function editBarcode(params: EditBarcodeRequest) {
  return api.post<EditBarcodeResponse>('barcodes/edit', params)
}

export async function removeBarcodes(params: RemoveBarcodesRequest) {
  return api.post<RemoveBarcodesResponse>('barcodes/remove', params)
}

export async function generateCode() {
  return api.get<GenerateCodeResponse>('barcodes/generate-code')
}

export async function getBarcodeByCode(params: GetBarcodeByCodeRequest) {
  return api.get<GetBarcodeByCodeResponse>('barcodes/get-by-code', { params })
}
