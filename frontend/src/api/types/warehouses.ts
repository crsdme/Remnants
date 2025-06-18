export interface getWarehousesParams {
  filters: {
    names?: string
    active?: boolean[]
    priority?: number
    language: string
  }
  sorters?: {
    priority?: string
    active?: string
  }
  pagination?: {
    full?: boolean
    current?: number
    pageSize?: number
  }
}

export interface createWarehousesParams {
  names: LanguageString
  priority: number
  active?: boolean
}

export interface editWarehouseParams {
  id: string
  names: LanguageString
  priority: number
  active?: boolean
}

export interface removeWarehouseParams {
  ids: string[]
}

export interface WarehousesResponse {
  status: string
  code: string
  message: string
  description: string
  warehouses: Warehouse[]
  warehousesCount: number
}
