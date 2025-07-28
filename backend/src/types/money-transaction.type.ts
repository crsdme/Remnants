import type { Code, DateRange, IdType, Message, Pagination, Sorter, Status } from './common.type'

export interface MoneyTransaction {
  id: IdType
  type: string
  direction: string
  account: string
  amount: number
  currency: string
  sourceModel: string
  sourceId: string
  createdAt: Date
  updatedAt: Date
}

export interface getMoneyTransactionsResult {
  status: Status
  code: Code
  message: Message
  moneyTransactions: MoneyTransaction[]
  moneyTransactionsCount: number
}

export interface getMoneyTransactionsFilters {
  type: string
  direction: string
  account: string
  amount: number
  currency: string
  cashregister: string
  description: string
  sourceModel: string
  sourceId: string
  createdAt: DateRange
  updatedAt: DateRange
}

export interface getMoneyTransactionsSorters {
  type: Sorter
  direction: Sorter
  account: Sorter
  sourceModel: Sorter
  sourceId: Sorter
  createdAt: Sorter
  updatedAt: Sorter
}

export interface getMoneyTransactionsParams {
  filters?: Partial<getMoneyTransactionsFilters>
  sorters?: Partial<getMoneyTransactionsSorters>
  pagination?: Partial<Pagination>
}

export interface createMoneyTransactionResult {
  status: Status
  code: Code
  message: Message
  moneyTransaction: MoneyTransaction
}

export interface createMoneyTransactionParams {
  type: string
  direction: string
  account: string
  cashregister: string
  sourceModel: string
  sourceId: string
  currency: string
  amount: number
  role?: string
  transferId?: string
  description?: string
}

export interface createMoneyTransferAccountParams {
  type: string
  direction: string
  accountFrom: string
  accountTo: string
  cashregister: string
  currency: string
  amount: number
  sourceModel: string
}

export interface createMoneyTransferCashregisterParams {
  type: string
  direction: string
  accountFrom: string
  accountTo: string
  cashregisterFrom: string
  cashregisterTo: string
  currency: string
  amount: number
  sourceModel: string
}

export interface editMoneyTransactionResult {
  status: Status
  code: Code
  message: Message
  moneyTransaction: MoneyTransaction
}

export interface editMoneyTransactionParams {
  id: IdType
  type: string
  direction: string
  account: string
  sourceModel: string
  sourceId: string
  amount: number
}

export interface removeMoneyTransactionsResult {
  status: Status
  code: Code
  message: Message
}

export interface removeMoneyTransactionsParams {
  ids: IdType[]
}
