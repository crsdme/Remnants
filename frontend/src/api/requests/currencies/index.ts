import { api } from '@/api/instance'

export interface getCurrenciesParams {
  filters: {
    names?: string
    symbols?: string
    language: string
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
    names?: number
    priority?: number
    createdAt?: number
    updatedAt?: number
  }
  pagination?: {
    full?: boolean
    current?: number
    pageSize?: number
  }
}

export async function getCurrencies(params: getCurrenciesParams) {
  return api.get<CurrenciesResponse>('currencies/get', { params })
}

export interface createCurrenciesParams {
  names: LanguageString
  symbols: LanguageString
  priority: number
  active?: boolean
}

export async function createCurrency(params: createCurrenciesParams) {
  return api.post<CurrenciesResponse>('currencies/create', { ...params })
}

export interface editCurrencyParams {
  id: string
  names: LanguageString
  symbols: LanguageString
  priority: number
  active?: boolean
}

export async function editCurrency(params: editCurrencyParams) {
  return api.post<CurrenciesResponse>('currencies/edit', params)
}

export interface removeCurrencyParams {
  ids: string[]
}

export async function removeCurrency(params: removeCurrencyParams) {
  return api.post<CurrenciesResponse>('currencies/remove', params)
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

export async function batchCurrency(params: batchCurrencyParams) {
  return api.post<CurrenciesResponse>('currencies/batch', params)
}

export interface importCurrenciesParams {
  file: File
}

export async function importCurrencies(params: importCurrenciesParams) {
  return api.post<CurrenciesResponse>('currencies/import', params, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export interface duplicateCurrencyParams {
  ids: string[]
}

export async function duplicateCurrency(params: duplicateCurrencyParams) {
  return api.post<CurrenciesResponse>('currencies/duplicate', params)
}
