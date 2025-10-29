import type { Code, DateRange, Message, Pagination, Status } from './common.type'

export interface Balance {
  _id: string
  seq: number
  warehouseBalance: { warehouseId: string, totals: { currencyId: string, amount: number }[] }[]
  cashregisterBalance: { cashregisterId: string, totals: { currencyId: string, amount: number }[] }[]
  comment: string
}

export interface getBalancesResult {
  status: Status
  code: Code
  message: Message
  balances: Balance[]
}

export interface getBalancesFilters {
  date: DateRange
  cashregister: string
  cashregisterAccount: string
}

export interface getBalancesParams {
  filters?: Partial<getBalancesFilters>
  pagination?: Pagination
}

export interface getCurrentBalanceParams {
  pagination?: Pagination
}

export interface getCurrentBalanceResult {
  status: Status
  code: Code
  message: Message
  balance: any
}

export interface createBalanceParams {
  comment?: string
}

export interface createBalanceResult {
  status: Status
  code: Code
  message: Message
  balance: Balance
}

export interface removeBalancesParams {
  id: string
}

export interface removeBalancesResult {
  status: Status
  code: Code
  message: Message
  balance: Balance
}
