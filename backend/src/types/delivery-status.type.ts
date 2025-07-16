import type { SUPPORTED_LANGUAGES_TYPE } from '../config/constants'
import type { Code, DateRange, IdType, LanguageString, Message, Pagination, Sorter, Status } from './common.type'

export interface DeliveryStatus {
  id: IdType
  names: LanguageString
  priority: number
  color: string
  removed: boolean
  createdAt: Date
  updatedAt: Date
}

export interface getDeliveryStatusesResult {
  status: Status
  code: Code
  message: Message
  deliveryStatuses: DeliveryStatus[]
  deliveryStatusesCount: number
}

export interface getDeliveryStatusesFilters {
  names: LanguageString
  language: SUPPORTED_LANGUAGES_TYPE
  color: string
  priority: number
  createdAt: DateRange
  updatedAt: DateRange
}

export interface getDeliveryStatusesSorters {
  names: Sorter
  color: Sorter
  priority: Sorter
  updatedAt: Sorter
  createdAt: Sorter
}

export interface getDeliveryStatusesParams {
  filters?: Partial<getDeliveryStatusesFilters>
  sorters?: Partial<getDeliveryStatusesSorters>
  pagination?: Partial<Pagination>
  isTree?: boolean
}

export interface createDeliveryStatusResult {
  status: Status
  code: Code
  message: Message
  deliveryStatus: DeliveryStatus
}

export interface createDeliveryStatusParams {
  names: LanguageString
  priority?: number
  color?: string
}

export interface editDeliveryStatusResult {
  status: Status
  code: Code
  message: Message
  deliveryStatus: DeliveryStatus
}

export interface editDeliveryStatusParams {
  id: IdType
  names: LanguageString
  priority?: number
  color?: string
}

export interface removeDeliveryStatusesResult {
  status: Status
  code: Code
  message: Message
}

export interface removeDeliveryStatusesParams {
  ids: IdType[]
}
