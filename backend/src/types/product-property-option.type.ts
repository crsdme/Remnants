import type { SUPPORTED_LANGUAGES_TYPE } from '../config/constants'
import type { Code, DateRange, IdType, LanguageString, Message, Pagination, Sorter, Status } from './common.type'

export interface ProductPropertyOption {
  id: IdType
  names: Map<string, string>
  priority: number
  active: boolean
  removed: boolean
  color: string
  createdAt: Date
  updatedAt: Date
}

export interface getProductPropertyOptionsResult {
  status: Status
  code: Code
  message: Message
  productPropertiesOptions: ProductPropertyOption[]
  productPropertiesOptionsCount: number
}

export interface getProductPropertyOptionsFilters {
  ids?: IdType[]
  names?: LanguageString
  language?: SUPPORTED_LANGUAGES_TYPE
  priority?: number
  active?: boolean
  productProperty?: IdType
  createdAt?: DateRange
  updatedAt?: DateRange
}

export interface getProductPropertyOptionsSorters {
  names?: Sorter
  priority?: Sorter
  active?: Sorter
  createdAt?: Sorter
  updatedAt?: Sorter
}

export interface getProductPropertyOptionsParams {
  filters?: Partial<getProductPropertyOptionsFilters>
  sorters?: Partial<getProductPropertyOptionsSorters>
  pagination?: Partial<Pagination>
}

export interface createProductPropertyOptionResult {
  status: Status
  code: Code
  message: Message
  productPropertyOption: ProductPropertyOption
}

export interface createProductPropertyOptionParams {
  names: LanguageString
  productProperty: IdType
  active: boolean
  priority: number
  color: string
}

export interface editProductPropertyOptionResult {
  status: Status
  code: Code
  message: Message
  productPropertyOption: ProductPropertyOption
}

export interface editProductPropertyOptionParams {
  id: IdType
  names: LanguageString
  active: boolean
  priority: number
  color: string
}

export interface removeProductPropertyOptionsResult {
  status: Status
  code: Code
  message: Message
}

export interface removeProductPropertyOptionsParams {
  ids: IdType[]
}
