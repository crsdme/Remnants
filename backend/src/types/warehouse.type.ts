import type { SUPPORTED_LANGUAGES_TYPE } from '../config/constants'
import type { Code, DateRange, IdType, LanguageString, Message, Pagination, Sorter, Status } from './common.type'

export interface Warehouse {
  id: IdType
  names: LanguageString
  priority: number
  active: boolean
  removed: boolean
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

export interface getWarehousesFilters {
  ids?: IdType[]
  names: LanguageString
  language: SUPPORTED_LANGUAGES_TYPE
  priority: number
  active: boolean
  createdAt: DateRange
  updatedAt: DateRange
}

export interface getWarehousesSorters {
  names: Sorter
  priority: Sorter
  active: Sorter
  updatedAt: Sorter
  createdAt: Sorter
}

export interface getWarehousesParams {
  filters?: Partial<getWarehousesFilters>
  sorters?: Partial<getWarehousesSorters>
  pagination?: Partial<Pagination>
}

export interface createWarehousesResult {
  status: Status
  code: Code
  message: Message
  warehouse: Warehouse
}

export interface createWarehousesParams {
  names: LanguageString
  priority?: number
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
  priority?: number
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
