export interface getExpenseCategoriesParams {
  filters?: {
    ids?: string[]
    names?: string
    color?: string
    comment?: string
  }
  sorters?: {
    priority?: string
  }
  pagination?: {
    full?: boolean
    current?: number
    pageSize?: number
  }
}

export interface createExpenseCategoryParams {
  names: LanguageString
  color: string
  comment?: string
}

export interface ExpenseCategoryResponse {
  status: string
  code: string
  message: string
  description: string
  expenseCategories: ExpenseCategory[]
  expenseCategoriesCount: number
}

export interface editExpenseCategoryParams {
  id: string
  names: LanguageString
  color: string
  comment?: string
}

export interface removeExpenseCategoriesParams {
  ids: string[]
}
