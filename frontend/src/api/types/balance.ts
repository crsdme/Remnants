export interface getBalancesParams {
  filters: {
    date?: Date
    warehouses?: string[]
    cashregisters?: string[]
  }
  sorters?: {
    createdAt?: string
    updatedAt?: string
  }
  pagination?: {
    full?: boolean
    current?: number
    pageSize?: number
  }
}

export interface getBalancesResponse {
  status: string
  code: string
  message: string
  balances: Balance[]
}

export interface getCurrentBalanceParams {
  pagination?: {
    full?: boolean
    current?: number
    pageSize?: number
  }
}

export interface getCurrentBalanceResponse {
  status: string
  code: string
  message: string
  balance: Balance
}

export interface createBalanceParams {
  comment?: string
}

export interface createBalanceResponse {
  status: string
  code: string
  message: string
  balance: Balance
}

export interface removeBalancesParams {
  id: string
}

export interface removeBalancesResponse {
  status: string
  code: string
  message: string
  balance: Balance
}
