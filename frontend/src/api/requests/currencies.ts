import type {
  CreateCurrencyRequest,
  CreateCurrencyResponse,
  EditCurrencyRequest,
  EditCurrencyResponse,
  EditExchangeRateRequest,
  EditExchangeRateResponse,
  GetCurrenciesResponse,
  GetCurrencyRequest,
  GetExchangeRatesRequest,
  GetExchangeRatesResponse,
  RemoveCurrenciesResponse,
  RemoveCurrencyRequest,
} from '@remnant/shared'
import { api } from '@/api/instance'

export async function getCurrencies(params: GetCurrencyRequest) {
  return api.get<GetCurrenciesResponse>('currencies/get', { params })
}

export async function getExchangeRates(params: GetExchangeRatesRequest) {
  return api.get<GetExchangeRatesResponse>('currencies/get-exchange-rates', { params })
}

export async function createCurrency(params: CreateCurrencyRequest) {
  return api.post<CreateCurrencyResponse>('currencies/create', { ...params })
}

export async function editCurrency(params: EditCurrencyRequest) {
  return api.post<EditCurrencyResponse>('currencies/edit', params)
}

export async function editExchangeRate(params: EditExchangeRateRequest) {
  return api.post<EditExchangeRateResponse>('currencies/edit-exchange-rate', params)
}

export async function removeCurrency(params: RemoveCurrencyRequest) {
  return api.post<RemoveCurrenciesResponse>('currencies/remove', params)
}
