import type { Code, DateRange, IdType, Message, Pagination, Sorter, Status } from './common.type'

export interface WarehouseTransaction {
  id: IdType
  type: string
  fromWarehouse: string
  toWarehouse: string
  requiresReceiving: boolean
  status: string
  createdBy: string
  comment: string
  createdAt: Date
  updatedAt: Date
}

export interface WarehouseTransactionItem {
  id: IdType
  transactionId: string
  productId: string
  quantity: number
  price: number
}

export interface getWarehouseTransactionsResult {
  status: Status
  code: Code
  message: Message
  warehouseTransactions: WarehouseTransaction[]
  warehouseTransactionsCount: number
}

export interface getWarehouseTransactionsFilters {
  type: string
  direction: string
  account: string
  amount: number
  currency: string
  cashregister: string
  description: string
  sourceModel: string
  sourceId: string
  createdAt: DateRange
  updatedAt: DateRange
}

export interface getWarehouseTransactionsSorters {
  type: Sorter
  direction: Sorter
  account: Sorter
  sourceModel: Sorter
  sourceId: Sorter
  createdAt: Sorter
  updatedAt: Sorter
}

export interface getWarehouseTransactionsParams {
  filters?: Partial<getWarehouseTransactionsFilters>
  sorters?: Partial<getWarehouseTransactionsSorters>
  pagination?: Partial<Pagination>
  isTree?: boolean
}

export interface createWarehouseTransactionResult {
  status: Status
  code: Code
  message: Message
  warehouseTransaction: WarehouseTransaction
}

export interface createWarehouseTransactionParams {
  type: string
  fromWarehouse: string
  toWarehouse: string
  requiresReceiving: boolean
  comment: string
  products: {
    id: string
    quantity: number
  }[]
}

export interface editWarehouseTransactionResult {
  status: Status
  code: Code
  message: Message
  warehouseTransaction: WarehouseTransaction
}

export interface editWarehouseTransactionParams {
  id: IdType
  type: string
  fromWarehouse: string
  toWarehouse: string
  requiresReceiving: boolean
  comment: string
  products: {
    id: string
    quantity: number
  }[]
}

export interface removeWarehouseTransactionsResult {
  status: Status
  code: Code
  message: Message
}

export interface removeWarehouseTransactionsParams {
  ids: IdType[]
}

export interface getWarehouseTransactionsItemsParams {
  filters: {
    transactionId: string
  }
  pagination?: {
    current?: number
    pageSize?: number
  }
}

export interface getWarehouseTransactionsItemsResult {
  status: Status
  code: Code
  message: Message
  warehouseTransactionsItems: WarehouseTransactionItem[]
  warehouseTransactionsItemsCount: number
}

export interface receiveWarehouseTransactionResult {
  status: Status
  code: Code
  message: Message
  warehouseTransaction: WarehouseTransaction
}

export interface receiveWarehouseTransactionParams {
  id: IdType
  products: {
    id: IdType
    quantity: number
    receivedQuantity: number
  }[]
}
