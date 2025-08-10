import type { SUPPORTED_LANGUAGES_TYPE } from '../config/constants'
import type { Code, DateRange, IdType, LanguageString, Message, Pagination, Sorter, Status } from './common.type'

export interface ProductProperty {
  id: IdType
  names: LanguageString
  options: IdType[]
  priority: number
  type: string
  isRequired: boolean
  showInTable: boolean
  active: boolean
  removed: boolean
  createdAt: Date
  updatedAt: Date
}

export interface getProductPropertiesResult {
  status: Status
  code: Code
  message: Message
  productProperties: ProductProperty[]
  productPropertiesCount: number
}

export interface getProductPropertiesFilters {
  ids: IdType[]
  names: LanguageString
  language: SUPPORTED_LANGUAGES_TYPE
  options: IdType[]
  type: string
  priority: number
  isRequired: boolean
  showInTable: boolean
  active: boolean[]
  createdAt: DateRange
  updatedAt: DateRange
}

export interface getProductPropertiesSorters {
  names: Sorter
  priority: Sorter
  type: Sorter
  isRequired: Sorter
  showInTable: Sorter
  active: Sorter
}

export interface getProductPropertiesParams {
  filters?: Partial<getProductPropertiesFilters>
  sorters?: Partial<getProductPropertiesSorters>
  pagination?: Partial<Pagination>
}

export interface createProductPropertyResult {
  status: Status
  code: Code
  message: Message
  productProperty: ProductProperty
}

export interface createProductPropertyParams {
  names: LanguageString
  priority?: number
  type: string
  showInTable: boolean
  isRequired: boolean
  active?: boolean
}

export interface editProductPropertyResult {
  status: Status
  code: Code
  message: Message
  productProperty: ProductProperty
}

export interface editProductPropertyParams {
  id: IdType
  names: LanguageString
  priority?: number
  type: string
  showInTable: boolean
  isRequired: boolean
  active?: boolean
}

export interface removeProductPropertiesResult {
  status: Status
  code: Code
  message: Message
}

export interface removeProductPropertiesParams {
  ids: IdType[]
}
