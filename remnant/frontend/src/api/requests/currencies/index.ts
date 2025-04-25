import { api } from '@/api/instance'

export interface getCurrenciesParams {
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
  sorters?: {
    names?: number
    priority?: number
    createdAt?: number
    updatedAt?: number
  }
  pagination: {
    full?: boolean
    current?: number
    pageSize?: number
  }
}

export async function getCurrencies(params: getCurrenciesParams) {
  return api.get<CurrenciesResponse>('currencies/get', { params })
}

export type createCurrenciesParams = Currency

export async function createCurrency(params: createCurrenciesParams) {
  return api.post<CurrenciesResponse>('currencies/create', { ...params })
}

export type editCurrencyParams = Currency

export async function editCurrency(params: editCurrencyParams) {
  return api.post<CurrenciesResponse>('currencies/edit', params)
}

export interface removeCurrencyParams {
  _ids: string[]
}

export async function removeCurrency(params: removeCurrencyParams) {
  return api.post<CurrenciesResponse>('currencies/remove', params)
}

interface batchItem {
  id: string
  column: string
  value: string | number | boolean | Record<string, string>
}

export interface batchCurrencyParams {
  _ids: string[]
  params: batchItem[]
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
