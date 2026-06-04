import type {
  IdType,
  Response,
  ResponseItem,
  ResponseList,
} from './common.type'

export interface WarehouseTransactionDTO {
  id: IdType
  type: string
  fromWarehouse: string
  toWarehouse: string
  requiresReceiving: boolean
  status: string
  accepted: boolean
  acceptedBy: string
  createdBy: string
  removedBy: string
  comment: string
  removedAt: Date
  acceptedAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface WarehouseTransactionItemDTO {
  id: IdType
  transactionId: string
  productId: string
  quantity: number
  price: number
}

export type GetWarehouseTransactionsResponse = ResponseList<WarehouseTransactionDTO>

export type CreateWarehouseTransactionResponse = ResponseItem<WarehouseTransactionDTO>

export type EditWarehouseTransactionResponse = ResponseItem<WarehouseTransactionDTO>

export type RemoveWarehouseTransactionsResponse = Response

export type GetWarehouseTransactionsItemsResponse = ResponseList<WarehouseTransactionItemDTO>

export type ReceiveWarehouseTransactionResponse = ResponseItem<WarehouseTransactionDTO>

export type ScanBarcodeToDraftsResponse = Response & { warehouseItems: WarehouseTransactionItemDTO[], transactionId?: string }
