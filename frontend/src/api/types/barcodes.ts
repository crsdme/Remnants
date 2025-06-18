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

export interface createBarcodesParams {
  code: string
  products: {
    _id: string
    quantity: number
  }[]
  active?: boolean
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

export interface removeBarcodesParams {
  ids: string[]
}

export interface BarcodesResponse {
  status: string
  code: string
  message: string
  description: string
  barcodes: Barcode[]
  barcodesCount: number
}
