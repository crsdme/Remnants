import type { SUPPORTED_LANGUAGES_TYPE } from '../config/constants'
import type { Code, DateRange, IdType, LanguageString, Message, Pagination, Sorter, Status } from './common.type'

export interface ExpenseCategory {
  id: IdType
  names: LanguageString
  color: string
  comment: string
  priority: number
  removed: boolean
  createdAt: Date
  updatedAt: Date
}

export interface getExpenseCategoriesResult {
  status: Status
  code: Code
  message: Message
  expenseCategories: ExpenseCategory[]
  expenseCategoriesCount: number
}

export interface getExpenseCategoriesFilters {
  ids: IdType[]
  names: LanguageString
  color: string
  comment: string
  priority: number
  createdAt: DateRange
  updatedAt: DateRange
}

export interface getExpenseCategoriesSorters {
  priority: Sorter
  updatedAt: Sorter
  createdAt: Sorter
}

export interface getExpenseCategoriesParams {
  filters?: Partial<getExpenseCategoriesFilters>
  sorters?: Partial<getExpenseCategoriesSorters>
  pagination?: Partial<Pagination>
}

export interface createExpenseCategoryResult {
  status: Status
  code: Code
  message: Message
  expenseCategory: ExpenseCategory
}

export interface createExpenseCategoryParams {
  names: LanguageString
  color: string
  comment?: string
  priority?: number
}

export interface editExpenseCategoryResult {
  status: Status
  code: Code
  message: Message
  expenseCategory: ExpenseCategory
}

export interface editExpenseCategoryParams {
  id: IdType
  names: LanguageString
  color: string
  comment?: string
  priority?: number
}

export interface removeExpenseCategoriesResult {
  status: Status
  code: Code
  message: Message
}

export interface removeExpenseCategoriesParams {
  ids: IdType[]
}
