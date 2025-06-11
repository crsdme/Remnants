import type { SUPPORTED_LANGUAGES_TYPE } from '../config/constants'
import type { Code, DateRange, IdType, LanguageString, Message, Pagination, Status } from './common.type'

export interface ProductPropertyGroup {
  names: Map<string, string>
  productProperties: IdType[]
  priority: number
  active: boolean
  removed: boolean
  createdAt: Date
  updatedAt: Date
}

export interface getProductPropertyGroupsResult {
  status: Status
  code: Code
  message: Message
  productPropertyGroups: ProductPropertyGroup[]
  productPropertyGroupsCount: number
}

export interface getProductPropertyGroupsParams {
  filters: {
    names: LanguageString
    language: SUPPORTED_LANGUAGES_TYPE
    productProperties: IdType[]
    active: boolean[]
    priority: number
    createdAt: DateRange
    updatedAt: DateRange
  }
  sorters: {
    names: string
    active: string
    priority: string
    createdAt: string
    updatedAt: string
  }
  pagination: Pagination
}

export interface createProductPropertyGroupResult {
  status: Status
  code: Code
  message: Message
  productPropertyGroup: ProductPropertyGroup
}

export interface createProductPropertyGroupParams {
  names: LanguageString
  productProperties: IdType[]
  priority: number
  active: boolean
}

export interface editProductPropertyGroupResult {
  status: Status
  code: Code
  message: Message
  productPropertyGroup: ProductPropertyGroup
}

export interface editProductPropertyGroupParams {
  id: IdType
  names: LanguageString
  productProperties: IdType[]
  priority: number
  active: boolean
}

export interface removeProductPropertyGroupsResult {
  status: Status
  code: Code
  message: Message
}

export interface removeProductPropertyGroupsParams {
  ids: IdType[]
}
