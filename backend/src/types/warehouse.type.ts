import type { Code, IdType, LanguageString, Message, Pagination, Status } from './common.type'

export interface Warehouse {
  names: LanguageString
  priority: number
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export interface getWarehousesResult {
  status: Status
  code: Code
  message: Message
  warehouses: Warehouse[]
  warehousesCount: number
}

export interface getWarehousesParams {
  filters: {
    names: LanguageString
    priority: number
    active: boolean
    language: string
  }
  sorters: {
    priority: string
    active: string
  }
  pagination: Pagination
}

export interface createWarehousesResult {
  status: Status
  code: Code
  message: Message
  warehouse: Warehouse
}

export interface createWarehousesParams {
  names: LanguageString
  priority: number
  active: boolean
}

export interface editWarehousesResult {
  status: Status
  code: Code
  message: Message
  warehouse: Warehouse
}

export interface editWarehousesParams {
  id: IdType
  names: LanguageString
  priority: number
  active: boolean
}

export interface removeWarehousesResult {
  status: Status
  code: Code
  message: Message
}

export interface removeWarehousesParams {
  ids: IdType[]
}
