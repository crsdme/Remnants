export interface getCashregisterAccountsParams {
  filters: {
    names?: string
    ids?: string[]
    active?: boolean[]
    priority?: number
    language?: string
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

export interface createCashregisterAccountsParams {
  names: LanguageString
  priority: number
  active?: boolean
}

export interface CashregisterAccountsResponse {
  status: string
  code: string
  message: string
  description: string
  cashregisterAccounts: CashregisterAccount[]
  cashregisterAccountsCount: number
}

export interface editCashregisterAccountsParams {
  id: string
  names: LanguageString
  priority: number
  active?: boolean
}

export interface removeCashregisterAccountsParams {
  ids: string[]
}
