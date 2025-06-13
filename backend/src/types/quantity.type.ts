import type { Code, IdType, Message, Pagination, Status } from './common.type'

export interface Quantity {
  count: number
  product: string
  warehouse: string
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

export interface getQuantitiesParams {
  filters: {
    product: string
    warehouse: string
    status: 'available' | 'reserved' | 'sold'
    count: number
  }
  sorters: {
    count: string
    status: string
    warehouse: string
  }
  pagination: Pagination
}

export interface createQuantitiesResult {
  status: Status
  code: Code
  message: Message
  quantity: Quantity
}

export interface createQuantitiesParams {
  count: number
  product: string
  warehouse: string
  status: 'available' | 'reserved' | 'sold'
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
  product: string
  warehouse: string
  status: 'available' | 'reserved' | 'sold'
}

export interface removeQuantitiesResult {
  status: Status
  code: Code
  message: Message
}

export interface removeQuantitiesParams {
  ids: IdType[]
}
