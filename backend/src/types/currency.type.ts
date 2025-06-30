import type { SUPPORTED_LANGUAGES_TYPE } from '../config/constants'
import type { Code, DateRange, IdType, LanguageString, Message, Pagination, Sorter, Status } from './common.type'

export interface Currency {
  id: IdType
  names: string
  symbols: string
  priority: number
  active: boolean
  removed: boolean
  createdAt: Date
  updatedAt: Date
}

export interface getCurrenciesResult {
  status: Status
  code: Code
  message: Message
  currencies: Currency[]
  currenciesCount: number
}

export interface getCurrenciesFilters {
  ids: IdType[]
  names: LanguageString
  symbols: LanguageString
  language: SUPPORTED_LANGUAGES_TYPE
  active: boolean[]
  priority: number
  createdAt: DateRange
  updatedAt: DateRange
}

export interface getCurrenciesSorters {
  names: Sorter
  symbols: Sorter
  active: Sorter
  priority: Sorter
  updatedAt: Sorter
  createdAt: Sorter
}

export interface getCurrenciesParams {
  filters?: Partial<getCurrenciesFilters>
  sorters?: Partial<getCurrenciesSorters>
  pagination?: Partial<Pagination>
}

export interface createCurrenciesResult {
  status: Status
  code: Code
  message: Message
  currency: Currency
}

export interface createCurrencyParams {
  names: LanguageString
  symbols: LanguageString
  priority?: number
  active?: boolean
}

export interface editCurrencyResult {
  status: Status
  code: Code
  message: Message
  currency: Currency
}

export interface editCurrencyParams {
  id: IdType
  names: LanguageString
  symbols: LanguageString
  priority?: number
  active?: boolean
}

export interface removeCurrenciesResult {
  status: Status
  code: Code
  message: Message
}

export interface removeCurrenciesParams {
  ids: IdType[]
}

export interface batchCurrenciesResult {
  status: Status
  code: Code
  message: Message
}

export interface batchCurrenciesParams {
  ids: IdType[]
  filters: Partial<getCurrenciesFilters>
  params: {
    column: string
    value: string | number | boolean | LanguageString
  }[]
}

export interface importCurrenciesResult {
  status: Status
  code: Code
  message: Message
  currencyIds: IdType[]
}

export interface importCurrenciesParams {
  file: Express.Multer.File
}

export interface duplicateCurrencyResult {
  status: Status
  code: Code
  message: Message
}

export interface duplicateCurrencyParams {
  ids: IdType[]
}
