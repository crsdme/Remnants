interface Warehouse {
  id: string
  names: LanguageString
  active: boolean
  priority: number
  createdAt: Date
  updatedAt: Date
}

interface WarehousesResponse {
  status: string
  code: string
  message: string
  description: string
  warehouses: Warehouse[]
  warehousesCount: number
}
