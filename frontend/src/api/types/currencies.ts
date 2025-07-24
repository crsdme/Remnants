export interface getCurrenciesParams {
  filters?: {
    ids?: string[]
    names?: string
    symbols?: string
    language?: string
    active?: boolean[]
    priority?: number
    createdAt?: {
      from?: Date
      to?: Date
    }
    updatedAt?: {
      from?: Date
      to?: Date
    }
  }
  sorters?: {
    names?: string
    priority?: string
    createdAt?: string
    updatedAt?: string
  }
  pagination?: {
    full?: boolean
    current?: number
    pageSize?: number
  }
}

export interface createCurrenciesParams {
  names: LanguageString
  symbols: LanguageString
  priority: number
  active?: boolean
}

export interface editCurrencyParams {
  id: string
  names: LanguageString
  symbols: LanguageString
  priority: number
  active?: boolean
}

export interface removeCurrencyParams {
  ids: string[]
}

interface batchItem {
  id: string
  column: string
  value: string | number | boolean | Record<string, string>
}

interface batchFilterItem {
  filters?: {
    names?: string
    symbols?: string
    language: string
    active?: boolean[]
    priority?: number
    createdAt?: {
      from?: Date
      to?: Date
    }
  }
}

export interface batchCurrencyParams {
  ids: string[]
  params: batchItem[]
  filters: batchFilterItem[]
}

export interface importCurrenciesParams {
  file: File
}

export interface duplicateCurrencyParams {
  ids: string[]
}

export interface CurrenciesResponse {
  status: string
  code: string
  message: string
  description: string
  currencies: Currency[]
  currenciesCount: number
}

export interface getExchangeRatesParams {
  filters?: {
    ids?: string[]
    fromCurrency?: string
    toCurrency?: string
  }
}

export interface getExchangeRatesResponse {
  status: string
  code: string
  message: string
  description: string
  exchangeRates: ExchangeRate[]
}

export interface editExchangeRateParams {
  id: string
  rate: number
  comment?: string
}
