import type { Code, IdType, Message, Pagination, Sorter, Status } from './common.type'

export interface Quantity {
  id: IdType
  count: number
  product: IdType
  warehouse: IdType
  status: 'available' | 'reserved' | 'sold'
  createdAt: Date
  updatedAt: Date
}

export interface getQuantitiesResult {
  status: Status
  code: Code
  message: Message
  quantities: Quantity[]
  quantitiesCount: number
}

export interface getQuantitiesFilters {
  product: IdType
  warehouse: IdType
  status: 'available' | 'reserved' | 'sold'
  count: number
}

export interface getQuantitiesSorters {
  count: Sorter
  status: Sorter
  warehouse: Sorter
}

export interface getQuantitiesParams {
  filters?: Partial<getQuantitiesFilters>
  sorters?: Partial<getQuantitiesSorters>
  pagination?: Partial<Pagination>
}

export interface createQuantitiesResult {
  status: Status
  code: Code
  message: Message
  quantity: Quantity
}

export interface createQuantitiesParams {
  count: number
  product: IdType
  warehouse: IdType
}

export interface countQuantitiesResult {
  status: Status
  code: Code
  message: Message
}

export interface countQuantitiesParams {
  count: number
  product: IdType
  warehouse: IdType
}

export interface editQuantitiesResult {
  status: Status
  code: Code
  message: Message
  quantity: Quantity
}

export interface editQuantitiesParams {
  id: IdType
  count: number
  product: IdType
  warehouse: IdType
}

export interface removeQuantitiesResult {
  status: Status
  code: Code
  message: Message
}

export interface removeQuantitiesParams {
  ids: IdType[]
}
