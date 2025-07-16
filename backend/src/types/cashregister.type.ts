import type { SUPPORTED_LANGUAGES_TYPE } from '../config/constants'
import type { Code, DateRange, IdType, LanguageString, Message, Pagination, Sorter, Status } from './common.type'

export interface Cashregister {
  id: IdType
  names: LanguageString
  priority: number
  accounts: Array<{
    name: string
    amount: number
  }>
  active: boolean
  removed: boolean
  createdAt: Date
  updatedAt: Date
}

export interface getCashregistersResult {
  status: Status
  code: Code
  message: Message
  cashregisters: Cashregister[]
  cashregistersCount: number
}

export interface getCashregistersFilters {
  names: LanguageString
  language: SUPPORTED_LANGUAGES_TYPE
  active: boolean[]
  priority: number
  accounts: IdType
  createdAt: DateRange
  updatedAt: DateRange
}

export interface getCashregistersSorters {
  names: Sorter
  active: Sorter
  priority: Sorter
  accounts: Sorter
  updatedAt: Sorter
  createdAt: Sorter
}

export interface getCashregistersParams {
  filters?: Partial<getCashregistersFilters>
  sorters?: Partial<getCashregistersSorters>
  pagination?: Partial<Pagination>
  isTree?: boolean
}

export interface createCashregisterResult {
  status: Status
  code: Code
  message: Message
  cashregister: Cashregister
}

export interface createCashregisterParams {
  names: LanguageString
  priority?: number
  accounts?: Array<{
    name: string
    amount: number
  }>
  active?: boolean
}

export interface editCashregisterResult {
  status: Status
  code: Code
  message: Message
  cashregister: Cashregister
}

export interface editCashregisterParams {
  id: IdType
  names: LanguageString
  priority?: number
  accounts?: Array<{
    name: string
    amount: number
  }>
  active?: boolean
}

export interface removeCashregistersResult {
  status: Status
  code: Code
  message: Message
}

export interface removeCashregistersParams {
  ids: IdType[]
}
