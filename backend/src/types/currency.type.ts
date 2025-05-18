import type { SUPPORTED_LANGUAGES_TYPE } from '../config/constants'
import type { Code, DateRange, IdType, LanguageString, Message, Pagination, Status } from './common.type'

export interface Currency {
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

export interface getCurrenciesParams {
  filters: {
    names: LanguageString
    symbols: LanguageString
    language: SUPPORTED_LANGUAGES_TYPE
    active: boolean[]
    priority: number
    createdAt: DateRange
    updatedAt: DateRange
  }
  sorters: {
    names: string
    symbols: string
    active: string
    priority: string
    updatedAt: string
    createdAt: string
  }
  pagination: Pagination
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
  priority: number
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
  priority: number
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
  filters: {
    names: LanguageString
    symbols: LanguageString
    language: SUPPORTED_LANGUAGES_TYPE
    active: boolean[]
    priority: number
    createdAt: DateRange
    updatedAt: DateRange
  }
  params: {
    column: string
    value: string | number | boolean | Record<string, string>
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
