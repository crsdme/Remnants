import type {
  batchCurrencyParams,
  createCurrenciesParams,
  CurrenciesResponse,
  duplicateCurrencyParams,
  editCurrencyParams,
  getCurrenciesParams,
  importCurrenciesParams,
  removeCurrencyParams,
} from '@/api/types/currencies'
import { api } from '@/api/instance'

export async function getCurrencies(params: getCurrenciesParams) {
  return api.get<CurrenciesResponse>('currencies/get', { params })
}

export async function createCurrency(params: createCurrenciesParams) {
  return api.post<CurrenciesResponse>('currencies/create', { ...params })
}

export async function editCurrency(params: editCurrencyParams) {
  return api.post<CurrenciesResponse>('currencies/edit', params)
}

export async function removeCurrency(params: removeCurrencyParams) {
  return api.post<CurrenciesResponse>('currencies/remove', params)
}

export async function batchCurrency(params: batchCurrencyParams) {
  return api.post<CurrenciesResponse>('currencies/batch', params)
}

export async function importCurrencies(params: importCurrenciesParams) {
  return api.post<CurrenciesResponse>('currencies/import', params, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export async function duplicateCurrency(params: duplicateCurrencyParams) {
  return api.post<CurrenciesResponse>('currencies/duplicate', params)
}
