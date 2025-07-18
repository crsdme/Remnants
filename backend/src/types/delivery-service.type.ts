import type { SUPPORTED_LANGUAGES_TYPE } from '../config/constants'
import type { Code, DateRange, IdType, LanguageString, Message, Pagination, Sorter, Status } from './common.type'

export interface DeliveryService {
  id: IdType
  names: LanguageString
  priority: number
  color: string
  type: 'novaposhta' | 'selfpickup'
  removed: boolean
  createdAt: Date
  updatedAt: Date
}

export interface getDeliveryServicesResult {
  status: Status
  code: Code
  message: Message
  deliveryServices: DeliveryService[]
  deliveryServicesCount: number
}

export interface getDeliveryServicesFilters {
  names: LanguageString
  language: SUPPORTED_LANGUAGES_TYPE
  color: string
  priority: number
  createdAt: DateRange
  updatedAt: DateRange
}

export interface getDeliveryServicesSorters {
  names: Sorter
  color: Sorter
  priority: Sorter
  updatedAt: Sorter
  createdAt: Sorter
}

export interface getDeliveryServicesParams {
  filters?: Partial<getDeliveryServicesFilters>
  sorters?: Partial<getDeliveryServicesSorters>
  pagination?: Partial<Pagination>
}

export interface createDeliveryServiceResult {
  status: Status
  code: Code
  message: Message
  deliveryService: DeliveryService
}

export interface createDeliveryServiceParams {
  names: LanguageString
  priority?: number
  color?: string
}

export interface editDeliveryServiceResult {
  status: Status
  code: Code
  message: Message
  deliveryService: DeliveryService
}

export interface editDeliveryServiceParams {
  id: IdType
  names: LanguageString
  priority?: number
  color?: string
}

export interface removeDeliveryServicesResult {
  status: Status
  code: Code
  message: Message
}

export interface removeDeliveryServicesParams {
  ids: IdType[]
}
