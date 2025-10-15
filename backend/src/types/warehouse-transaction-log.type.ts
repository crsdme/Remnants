import type { Code, DateRange, IdType, Message, Pagination, Sorter, Status } from './common.type'

export interface WarehouseTransactionLog {
  id: IdType
  productId: string
  warehouseId: string
  deltaCount: number
  refType: string
  refId: string
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface getWarehouseTransactionLogsResult {
  status: Status
  code: Code
  message: Message
  warehouseTransactionLogs: WarehouseTransactionLog[]
  warehouseTransactionLogsCount: number
}

export interface getWarehouseTransactionLogsFilters {
  ids?: IdType[]
  productId: string
  warehouseId: string
  refType: string
  refId: string
  userId: string
  createdAt: DateRange
  updatedAt: DateRange
}

export interface getWarehouseTransactionLogsSorters {
  productId: Sorter
  warehouseId: Sorter
  refType: Sorter
  refId: Sorter
  userId: Sorter
  updatedAt: Sorter
  createdAt: Sorter
}

export interface getWarehouseTransactionLogsParams {
  filters?: Partial<getWarehouseTransactionLogsFilters>
  sorters?: Partial<getWarehouseTransactionLogsSorters>
  pagination?: Partial<Pagination>
}

export interface createWarehouseTransactionLogsResult {
  status: Status
  code: Code
  message: Message
  warehouseTransactionLog: WarehouseTransactionLog
}

export interface createWarehouseTransactionLogsParams {
  productId: string
  warehouseId: string
  deltaCount: number
  refType: string
  refId: string
  userId: string
}
