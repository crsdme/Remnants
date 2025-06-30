import type { SUPPORTED_LANGUAGES_TYPE } from '../config/constants'
import type { Code, DateRange, IdType, LanguageString, Message, Pagination, Sorter, Status } from './common.type'

export interface ProductPropertyGroup {
  id: IdType
  names: LanguageString
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

export interface getProductPropertyGroupsFilters {
  names: LanguageString
  language: SUPPORTED_LANGUAGES_TYPE
  productProperties: IdType[]
  active: boolean[]
  priority: number
  createdAt: DateRange
  updatedAt: DateRange
}

export interface getProductPropertyGroupsSorters {
  names: Sorter
  active: Sorter
  priority: Sorter
  createdAt: Sorter
  updatedAt: Sorter
}

export interface getProductPropertyGroupsParams {
  filters?: Partial<getProductPropertyGroupsFilters>
  sorters?: Partial<getProductPropertyGroupsSorters>
  pagination?: Partial<Pagination>
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
  priority?: number
  active?: boolean
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
  priority?: number
  active?: boolean
}

export interface removeProductPropertyGroupsResult {
  status: Status
  code: Code
  message: Message
}

export interface removeProductPropertyGroupsParams {
  ids: IdType[]
}
