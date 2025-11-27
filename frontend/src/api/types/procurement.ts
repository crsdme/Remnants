export interface getProcurementsParams {
  filters: {
    seq?: string[]
    supplier?: string
    status?: string
    warehouse?: string
    createdAt?: {
      from?: string
      to?: string
    }[]
  }
  sorters?: {
    createdAt?: string
  }
  pagination?: {
    current?: number
    pageSize?: number
  }
}

export interface createProcurementsParams {
  supplier: string
  status: string
  warehouse: string
  expenses: string[]
  payments: string[]
  createdBy: string
  comment: string
  items: ProcurementItem[]
}

export interface getProcurementsResponse {
  status: string
  code: string
  message: string
  description: string
  procurements: Procurement[]
  procurementsCount: number
}

export interface editProcurementsParams {
  id: string
  supplier: string
  status: string
  warehouse: string
  expenses: string[]
  payments: string[]
  comment: string
  items: ProcurementItem[]
}

export interface removeProcurementsParams {
  ids: string[]
}

export interface getProcurementItemsParams {
  filters?: {
    procurementId?: string
  }
  pagination?: {
    current?: number
    pageSize?: number
    full?: boolean
  }
}

export interface getProcurementItemsResponse {
  status: string
  code: string
  message: string
  description: string
  procurementItems: ProcurementItem[]
  procurementItemsCount: number
}

export interface editProcurementItemsParams {
  id: string
  procurementId: string
  productId: string
  quantity: number
  receivedQuantity: number
}

export interface scanBarcodeResponse {
  status: string
  code: string
  message: string
  description: string
  procurementItems: ProcurementItem[]
}

export interface scanBarcodeParams {
  barcode: string
  procurementId?: string
}

export interface payProcurementParams {
  id: string
  procurementId: string
  cashregister: string
  account: string
  currency: string
  amount: number
  comment: string
}

export interface payProcurementResponse {
  status: string
  code: string
  message: string
  description: string
  procurement: Procurement
}
