export interface getExpensesParams {
  filters?: {
    ids?: string[]
    amount?: number
    currency?: string
    cashregister?: string
    cashregisterAccount?: string
    categories?: string[]
    sourceModel?: string
    sourceId?: string
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

export interface createExpenseParams {
  amount: number
  currency: string
  cashregister: string
  cashregisterAccount: string
  categories: string[]
  comment?: string
}

export interface ExpenseResponse {
  status: string
  code: string
  message: string
  description: string
  expenses: Expense[]
  expensesCount: number
}

export interface editExpenseParams {
  id: string
  amount: number
  currency: string
  cashregister: string
  cashregisterAccount: string
  categories: string[]
  comment?: string
}

export interface removeExpensesParams {
  ids: string[]
}
