export interface getCashregistersParams {
  filters?: {
    names?: string
    active?: boolean[]
    priority?: number
    language?: string
    ids?: string[]
    cashregisterAccounts?: string[]
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

export interface createCashregistersParams {
  names: LanguageString
  priority: number
  active?: boolean
}

export interface CashregistersResponse {
  status: string
  code: string
  message: string
  description: string
  cashregisters: Cashregister[]
  cashregistersCount: number
}

export interface editCashregistersParams {
  id: string
  names: LanguageString
  priority: number
  active?: boolean
}

export interface removeCashregistersParams {
  ids: string[]
}
