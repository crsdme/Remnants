export interface getInventoriesParams {
  filters: {
    status?: string
    warehouse?: string
    createdAt?: Date
  }
  sorters?: {
    createdAt?: string
  }
  pagination?: {
    current?: number
    pageSize?: number
  }
}

export interface createInventoriesParams {
  warehouse: string
  category: string
  comment?: string
  items?: {
    id: string
    quantity: number
  }[]
}

export interface InventoriesResponse {
  status: string
  code: string
  message: string
  description: string
  inventories: Inventory[]
  inventoriesCount: number
}

export interface editInventoriesParams {
  id: string
  warehouse: string
  comment?: string
  items?: {
    id: string
    quantity: number
  }[]
}

export interface removeInventoriesParams {
  ids: string[]
}

export interface getInventoryItemsParams {
  filters?: {
    inventoryId?: string
  }
  pagination?: {
    current?: number
    pageSize?: number
  }
}

export interface InventoryItemsResponse {
  status: string
  code: string
  message: string
  description: string
  inventoryItems: InventoryItem[]
  inventoryItemsCount: number
}

export interface receiveInventoriesParams {
  id: string
  items: {
    id: string
    quantity: number
    receivedQuantity: number
  }[]
}

export interface scanInventoryBarcodeParams {
  filters: {
    barcode: string
    category: string
    inventoryId?: string
  }
  sorters: {
    createdAt?: string
  }
}

export interface scanInventoryBarcodeResponse {
  status: string
  code: string
  message: string
  description: string
  inventoryItems: InventoryItem[]
  inventoryId?: string
}
