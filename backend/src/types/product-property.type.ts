import type { SUPPORTED_LANGUAGES_TYPE } from '../config/constants'
import type { Code, DateRange, IdType, LanguageString, Message, Pagination, Status } from './common.type'

export interface ProductProperty {
  names: Map<string, string>
  options: IdType[]
  priority: number
  type: string
  isMultiple: boolean
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

export interface getProductPropertiesParams {
  filters: {
    ids: IdType[]
    names: LanguageString
    language: SUPPORTED_LANGUAGES_TYPE
    options: IdType[]
    type: string
    priority: number
    isMultiple: boolean
    isRequired: boolean
    showInTable: boolean
    active: boolean
    createdAt: DateRange
    updatedAt: DateRange
  }
  sorters: {
    names: string
    priority: string
    type: string
    isMultiple: string
    isRequired: string
    showInTable: string
    active: string
    createdAt: string
    updatedAt: string
  }
  pagination: Pagination
}

export interface createProductPropertyResult {
  status: Status
  code: Code
  message: Message
  productProperty: ProductProperty
}

export interface createProductPropertyParams {
  names: LanguageString
  priority: number
  type: string
  isMultiple: boolean
  showInTable: boolean
  active: boolean
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
  priority: number
  type: string
  isMultiple: boolean
  showInTable: boolean
  active: boolean
}

export interface removeProductPropertiesResult {
  status: Status
  code: Code
  message: Message
}

export interface removeProductPropertiesParams {
  ids: IdType[]
}
