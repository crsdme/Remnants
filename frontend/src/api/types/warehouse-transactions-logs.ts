export interface getWarehouseTransactionsLogsParams {
  filters: {
    productId?: string
    warehouseId?: string
    refType?: string
    refId?: string
    userId?: string
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

export interface WarehouseTransactionsLogsResponse {
  status: string
  code: string
  message: string
  description: string
  warehouseTransactions: WarehouseTransactionLog[]
  warehouseTransactionsCount: number
}
