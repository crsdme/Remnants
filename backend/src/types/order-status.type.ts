import type { SUPPORTED_LANGUAGES_TYPE } from '../config/constants'
import type { Code, DateRange, IdType, LanguageString, Message, Pagination, Sorter, Status } from './common.type'

export interface OrderStatus {
  id: IdType
  names: LanguageString
  priority: number
  color: string
  removed: boolean
  createdAt: Date
  updatedAt: Date
}

export interface getOrderStatusesResult {
  status: Status
  code: Code
  message: Message
  orderStatuses: OrderStatus[]
  orderStatusesCount: number
}

export interface getOrderStatusesFilters {
  names: LanguageString
  language: SUPPORTED_LANGUAGES_TYPE
  color: string
  priority: number
  createdAt: DateRange
  updatedAt: DateRange
}

export interface getOrderStatusesSorters {
  names: Sorter
  color: Sorter
  priority: Sorter
  updatedAt: Sorter
  createdAt: Sorter
}

export interface getOrderStatusesParams {
  filters?: Partial<getOrderStatusesFilters>
  sorters?: Partial<getOrderStatusesSorters>
  pagination?: Partial<Pagination>
}

export interface createOrderStatusResult {
  status: Status
  code: Code
  message: Message
  orderStatus: OrderStatus
}

export interface createOrderStatusParams {
  names: LanguageString
  priority?: number
  color?: string
}

export interface editOrderStatusResult {
  status: Status
  code: Code
  message: Message
  orderStatus: OrderStatus
}

export interface editOrderStatusParams {
  id: IdType
  names: LanguageString
  priority?: number
  color?: string
}

export interface removeOrderStatusesResult {
  status: Status
  code: Code
  message: Message
}

export interface removeOrderStatusesParams {
  ids: IdType[]
}
