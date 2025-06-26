export interface getMoneyTransactionsParams {
  filters: {
    names?: string
    active?: boolean[]
    priority?: number
    language: string
  }
  sorters?: {
    priority?: string
    active?: string
  }
  pagination?: {
    full?: boolean
    current?: number
    pageSize?: number
  }
}

export interface createMoneyTransactionsParams {
  type: string
  direction?: string
  accountFrom?: string
  accountTo?: string
  account?: string
  cashregister?: string
  cashregisterFrom?: string
  cashregisterTo?: string
  currency: string
  amount: number
  sourceModel: string
  sourceId?: string
  role?: string
  transferId?: string
  description?: string
}

export interface MoneyTransactionsResponse {
  status: string
  code: string
  message: string
  description: string
  moneyTransactions: MoneyTransaction[]
  moneyTransactionsCount: number
}

export interface editMoneyTransactionsParams {
  id: string
  names: LanguageString
  priority: number
  active?: boolean
}

export interface removeMoneyTransactionsParams {
  ids: string[]
}
