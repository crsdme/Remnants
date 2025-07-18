import type { SUPPORTED_LANGUAGES_TYPE } from '../config/constants'
import type { Code, DateRange, IdType, LanguageString, Message, Pagination, Sorter, Status } from './common.type'

export interface CashregisterAccount {
  id: IdType
  names: LanguageString
  currencies: string[]
  priority: number
  active: boolean
  removed: boolean
  createdAt: Date
  updatedAt: Date
}

export interface getCashregisterAccountsResult {
  status: Status
  code: Code
  message: Message
  cashregisterAccounts: CashregisterAccount[]
  cashregisterAccountsCount: number
}

export interface getCashregisterAccountsFilters {
  ids: IdType[]
  names: LanguageString
  language: SUPPORTED_LANGUAGES_TYPE
  active: boolean[]
  priority: number
  balance: IdType
  cashregister: IdType[]
  createdAt: DateRange
  updatedAt: DateRange
}

export interface getCashregisterAccountsSorters {
  names: Sorter
  active: Sorter
  priority: Sorter
  accounts: Sorter
  updatedAt: Sorter
  createdAt: Sorter
}

export interface getCashregisterAccountsParams {
  filters?: Partial<getCashregisterAccountsFilters>
  sorters?: Partial<getCashregisterAccountsSorters>
  pagination?: Partial<Pagination>
}

export interface createCashregisterAccountResult {
  status: Status
  code: Code
  message: Message
  cashregisterAccount: CashregisterAccount
}

export interface createCashregisterAccountParams {
  names: LanguageString
  currencies: string[]
  priority?: number
  active?: boolean
}

export interface editCashregisterAccountResult {
  status: Status
  code: Code
  message: Message
  cashregisterAccount: CashregisterAccount
}

export interface editCashregisterAccountParams {
  id: IdType
  names: LanguageString
  priority?: number
  currencies: string[]
  active?: boolean
}

export interface removeCashregisterAccountsResult {
  status: Status
  code: Code
  message: Message
}

export interface removeCashregisterAccountsParams {
  ids: IdType[]
}
