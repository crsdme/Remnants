import type { Buffer } from 'node:buffer'
import type { SUPPORTED_LANGUAGES_TYPE } from '../config/constants'
import type { Code, DateRange, IdType, LanguageString, Message, Pagination, Status } from './common.type'

export interface Category {
  names: Map<string, string>
  priority: number
  parent: IdType
  active: boolean
  removed: boolean
  createdAt: Date
  updatedAt: Date
}

export interface getCategoriesResult {
  status: Status
  code: Code
  message: Message
  categories: Category[]
  categoriesCount: number
}

export interface getCategoriesParams {
  filters: {
    names: LanguageString
    language: SUPPORTED_LANGUAGES_TYPE
    active: boolean[]
    priority: number
    parent: IdType
    createdAt: DateRange
    updatedAt: DateRange
  }
  sorters: {
    names: string
    active: string
    priority: string
    parent: string
    updatedAt: string
    createdAt: string
  }
  pagination: Pagination
  isTree: boolean
}

export interface createCategoryResult {
  status: Status
  code: Code
  message: Message
  category: Category
}

export interface createCategoryParams {
  names: LanguageString
  priority: number
  parent: IdType
  active?: boolean
}

export interface editCategoryResult {
  status: Status
  code: Code
  message: Message
  category: Category
}

export interface editCategoryParams {
  id: IdType
  names: LanguageString
  priority: number
  parent: IdType
  active?: boolean
}

export interface removeCategoriesResult {
  status: Status
  code: Code
  message: Message
}

export interface removeCategoriesParams {
  ids: IdType[]
}

export interface batchCategoriesResult {
  status: Status
  code: Code
  message: Message
}

export interface batchCategoriesParams {
  ids: IdType[]
  filters: {
    names: LanguageString
    language: SUPPORTED_LANGUAGES_TYPE
    active: boolean[]
    priority: number
    createdAt: DateRange
    updatedAt: DateRange
  }
  params: {
    column: string
    value: string | number | boolean | Record<string, string>
  }[]
}

export interface importCategoriesResult {
  status: Status
  code: Code
  message: Message
  categoryIds: IdType[]
}

export interface importCategoriesParams {
  file: Express.Multer.File
}

export interface duplicateCategoryResult {
  status: Status
  code: Code
  message: Message
}

export interface duplicateCategoryParams {
  ids: IdType[]
}

export interface exportCategoriesResult {
  status: Status
  code: Code
  message: Message
  buffer: Buffer
}

export interface exportCategoriesParams {
  ids?: IdType[]
}
