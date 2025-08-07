import type { Code, DateRange, IdType, Message, Pagination, Sorter, Status } from './common.type'

export interface Inventory {
  id: IdType
  status: string
  warehouse: string
  createdBy: string
  removedBy: string
  items: InventoryItem[]
  comment: string
  removedAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface InventoryItem {
  id: IdType
  inventoryId: string
  productId: string
  quantity: number
  price: number
}

export interface getInventoriesResult {
  status: Status
  code: Code
  message: Message
  inventories: Inventory[]
  inventoriesCount: number
}

export interface getInventoriesFilters {
  status: string
  warehouse: string
  createdAt: DateRange
  updatedAt: DateRange
}

export interface getInventoriesSorters {
  status: Sorter
  warehouse: Sorter
  createdAt: Sorter
  updatedAt: Sorter
}

export interface getInventoriesParams {
  filters?: Partial<getInventoriesFilters>
  sorters?: Partial<getInventoriesSorters>
  pagination?: Partial<Pagination>
}

export interface createInventoryResult {
  status: Status
  code: Code
  message: Message
  inventory: Inventory
}

export interface createInventoryParams {
  status: string
  warehouse: string
  category: string
  comment: string
  items: {
    id: string
    quantity: number
    receivedQuantity: number
  }[]
}

export interface editInventoryResult {
  status: Status
  code: Code
  message: Message
  inventory: Inventory
}

export interface editInventoryParams {
  id: IdType
  status: string
  warehouse: string
  category: string
  comment: string
  items: {
    id: string
    quantity: number
  }[]
}

export interface removeInventoriesResult {
  status: Status
  code: Code
  message: Message
}

export interface removeInventoriesParams {
  ids: IdType[]
}

export interface getInventoryItemsParams {
  filters: {
    inventoryId: string
  }
  pagination?: {
    current?: number
    pageSize?: number
  }
}

export interface getInventoryItemsResult {
  status: Status
  code: Code
  message: Message
  inventoryItems: InventoryItem[]
  inventoryItemsCount: number
}

export interface receiveInventoryResult {
  status: Status
  code: Code
  message: Message
  inventory: Inventory
}

export interface receiveInventoryParams {
  id: IdType
  items: {
    id: IdType
    quantity: number
    receivedQuantity: number
  }[]
}

export interface scanBarcodeToDraftParams {
  filters: {
    barcode: string
    category: string
    inventoryId?: string
  }
  sorters: {
    createdAt?: string
  }
}

export interface scanBarcodeToDraftResult {
  status: Status
  code: Code
  message: Message
  inventoryItems: InventoryItem[]
  productIndex?: number
  inventoryId?: string
}
