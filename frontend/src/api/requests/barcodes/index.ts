import { api } from '@/api/instance'

export interface getBarcodesParams {
  filters: {
    code?: string
    active?: boolean[]
    products?: string[]
  }
  sorters?: {
    code?: string
    active?: string
    updatedAt?: string
    createdAt?: string
  }
  pagination?: {
    full?: boolean
    current?: number
    pageSize?: number
  }
}

export async function getBarcodes(params: getBarcodesParams) {
  return api.get<BarcodesResponse>('barcodes/get', { params })
}

export interface createBarcodesParams {
  code: string
  products: {
    _id: string
    quantity: number
  }[]
  active?: boolean
}

export async function createBarcode(params: createBarcodesParams) {
  return api.post<BarcodesResponse>('barcodes/create', { ...params })
}

export interface editBarcodeParams {
  id: string
  code: string
  products: {
    _id: string
    quantity: number
  }[]
  active?: boolean
}

export async function editBarcode(params: editBarcodeParams) {
  return api.post<BarcodesResponse>('barcodes/edit', params)
}

export interface removeBarcodesParams {
  ids: string[]
}

export async function removeBarcodes(params: removeBarcodesParams) {
  return api.post<BarcodesResponse>('barcodes/remove', params)
}
