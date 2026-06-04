import type {
  IdType,
  Response,
  ResponseItem,
  ResponseList,
} from './common.type'

export interface InventoryDTO {
  id: IdType
  status: string
  warehouse: string
  createdBy: string
  removedBy: string
  items: InventoryItemDTO[]
  comment: string
  removedAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface InventoryItemDTO {
  id: IdType
  inventoryId: string
  productId: string
  quantity: number
  price: number
}

export type GetInventoriesResponse = ResponseList<InventoryDTO>

export type CreateInventoryResponse = ResponseItem<InventoryDTO>

export type EditInventoryResponse = ResponseItem<InventoryDTO>

export type RemoveInventoriesResponse = Response

export type GetInventoryItemsResponse = ResponseList<InventoryItemDTO>

export type ReceiveInventoryResponse = Response

export interface ScanBarcodeToDraftResponse extends Response {
  inventoryItems: InventoryItemDTO[]
  productIndex?: number
  inventoryId?: string
}
