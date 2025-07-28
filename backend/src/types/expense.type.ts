import type { Code, DateRange, IdType, Message, Pagination, Sorter, Status } from './common.type'

export interface Expense {
  id: IdType
  seq: number
  amount: number
  currency: IdType
  cashregister: IdType
  cashregisterAccount: IdType
  categories: IdType[]
  sourceModel: string
  sourceId: IdType
  type: string
  comment: string
  createdBy: IdType
  removedBy: IdType
  removed: boolean
  createdAt: Date
  updatedAt: Date
}

export interface getExpensesResult {
  status: Status
  code: Code
  message: Message
  expenses: Expense[]
  expensesCount: number
}

export interface getExpensesFilters {
  ids: IdType[]
  amount: number
  currency: IdType
  cashregister: IdType
  cashregisterAccount: IdType
  categories: IdType[]
  sourceModel: string
  sourceId: IdType
  type: string
  createdAt: DateRange
  updatedAt: DateRange
}

export interface getExpensesSorters {
  amount: Sorter
  currency: Sorter
  cashregister: Sorter
  cashregisterAccount: Sorter
  category: Sorter
  sourceModel: Sorter
  sourceId: Sorter
  type: Sorter
  updatedAt: Sorter
  createdAt: Sorter
}

export interface getExpensesParams {
  filters?: Partial<getExpensesFilters>
  sorters?: Partial<getExpensesSorters>
  pagination?: Partial<Pagination>
}

export interface createExpenseResult {
  status: Status
  code: Code
  message: Message
  expense: Expense
}

export interface createExpenseParams {
  amount: number
  currency: IdType
  cashregister: IdType
  cashregisterAccount: IdType
  category: IdType
  sourceModel: string
  sourceId: IdType
  type: string
  comment?: string
}

export interface editExpenseResult {
  status: Status
  code: Code
  message: Message
  expense: Expense
}

export interface editExpenseParams {
  id: IdType
  amount: number
  currency: IdType
  cashregister: IdType
  cashregisterAccount: IdType
  category: IdType
  sourceModel: string
  sourceId: IdType
  type: string
  comment?: string
}

export interface removeExpensesResult {
  status: Status
  code: Code
  message: Message
}

export interface removeExpensesParams {
  ids: IdType[]
}
