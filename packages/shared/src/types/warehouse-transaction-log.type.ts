import type {
  IdType,
  ResponseItem,
  ResponseList,
} from './common.type'

export interface WarehouseTransactionLogDTO {
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

export type GetWarehouseTransactionLogsResponse = ResponseList<WarehouseTransactionLogDTO>

export type CreateWarehouseTransactionLogsResponse = ResponseItem<WarehouseTransactionLogDTO>
