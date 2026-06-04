import type {
  IdType,
  LanguageString,
  Response,
  ResponseItem,
  ResponseItems,
  ResponseList,
} from './common.type'

export interface CurrencyDTO {
  id: IdType
  names: LanguageString
  symbols: LanguageString
  priority: number
  active: boolean
  scale: number
  createdAt: Date
  updatedAt: Date
}

export interface ExchangeRateDTO {
  id: IdType
  fromCurrency: IdType
  toCurrency: IdType
  rate: number
  comment: string
  createdAt: Date
  updatedAt: Date
}

export type GetCurrenciesResponse = ResponseList<CurrencyDTO>

export type CreateCurrenciesResponse = ResponseItem<CurrencyDTO>

export type EditCurrenciesResponse = ResponseItem<CurrencyDTO>

export type RemoveCurrenciesResponse = Response

export type GetExchangeRatesResponse = ResponseList<ExchangeRateDTO>

export type EditExchangeRateResponse = ResponseItem<ExchangeRateDTO>
