import type { SUPPORTED_LANGUAGES_TYPE } from '../config/constants'
import type { Code, DateRange, IdType, LanguageString, Message, Pagination, Sorter, Status } from './common.type'

export interface OrderSource {
  id: IdType
  names: LanguageString
  priority: number
  color: string
  removed: boolean
  createdAt: Date
  updatedAt: Date
}

export interface getOrderSourcesResult {
  status: Status
  code: Code
  message: Message
  orderSources: OrderSource[]
  orderSourcesCount: number
}

export interface getOrderSourcesFilters {
  names: LanguageString
  language: SUPPORTED_LANGUAGES_TYPE
  color: string
  priority: number
  createdAt: DateRange
  updatedAt: DateRange
}

export interface getOrderSourcesSorters {
  names: Sorter
  color: Sorter
  priority: Sorter
  updatedAt: Sorter
  createdAt: Sorter
}

export interface getOrderSourcesParams {
  filters?: Partial<getOrderSourcesFilters>
  sorters?: Partial<getOrderSourcesSorters>
  pagination?: Partial<Pagination>
}

export interface createOrderSourceResult {
  status: Status
  code: Code
  message: Message
  orderSource: OrderSource
}

export interface createOrderSourceParams {
  names: LanguageString
  priority?: number
  color?: string
}

export interface editOrderSourceResult {
  status: Status
  code: Code
  message: Message
  orderSource: OrderSource
}

export interface editOrderSourceParams {
  id: IdType
  names: LanguageString
  priority?: number
  color?: string
}

export interface removeOrderSourcesResult {
  status: Status
  code: Code
  message: Message
}

export interface removeOrderSourcesParams {
  ids: IdType[]
}
