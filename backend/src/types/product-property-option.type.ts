import type { SUPPORTED_LANGUAGES_TYPE } from '../config/constants'
import type { Code, DateRange, IdType, LanguageString, Message, Pagination, Status } from './common.type'

export interface ProductPropertyOption {
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

export interface getProductPropertyOptionsParams {
  filters: {
    ids: IdType[]
    names: LanguageString
    language: SUPPORTED_LANGUAGES_TYPE
    priority: number
    active: boolean
    productProperty: IdType
    createdAt: DateRange
    updatedAt: DateRange
  }
  sorters: {
    names: string
    priority: string
    active: string
    createdAt: string
    updatedAt: string
  }
  pagination: Pagination
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
