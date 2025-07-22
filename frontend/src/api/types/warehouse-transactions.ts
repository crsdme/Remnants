export interface getWarehouseTransactionsParams {
  filters: {
    type?: string
    products?: string[]
    createdAt?: {
      from?: string
      to?: string
    }
  }
  sorters?: {
    createdAt?: string
  }
  pagination?: {
    current?: number
    pageSize?: number
  }
}

export interface createWarehouseTransactionsParams {
  type: 'in' | 'out' | 'transfer'
  fromWarehouse?: string
  toWarehouse?: string
  requiresReceiving?: boolean
  comment?: string
  products?: {
    id: string
    quantity: number
  }[]
}

export interface WarehouseTransactionsResponse {
  status: string
  code: string
  message: string
  description: string
  warehouseTransactions: WarehouseTransaction[]
  warehouseTransactionsCount: number
}

export interface editWarehouseTransactionsParams {
  id: string
  type: 'in' | 'out' | 'transfer'
  fromWarehouse?: string
  toWarehouse?: string
  requiresReceiving?: boolean
  comment?: string
  products?: {
    id: string
    quantity: number
  }[]
}

export interface removeWarehouseTransactionsParams {
  ids: string[]
}

export interface getWarehouseTransactionsItemsParams {
  filters?: {
    transactionId?: string
  }
  pagination?: {
    current?: number
    pageSize?: number
  }
}

export interface WarehouseTransactionsItemsResponse {
  status: string
  code: string
  message: string
  description: string
  warehouseTransactionsItems: WarehouseTransactionItem[]
  warehouseTransactionsItemsCount: number
}

export interface receiveWarehouseTransactionsParams {
  id: string
  products: {
    id: string
    quantity: number
    receivedQuantity: number
  }[]
}

export interface scanBarcodeToDraftParams {
  barcode: string
  transactionId?: string
}

export interface scanBarcodeToDraftResponse {
  status: string
  code: string
  message: string
  description: string
  warehouseItems: WarehouseTransactionItem[]
  transactionId?: string
}
