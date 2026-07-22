import type {
  CurrencyDTO,
  ExchangeRateDTOPopulated,
} from '@remnant/shared'
import type { z } from 'zod'
import type { currencyDBSchema, exchangeRateDBSchema } from '../schemas'
import {
  createCurrencySchema,
  editCurrencySchema,
  editExchangeRateSchema,
  getCurrencySchema,
  getExchangeRatesSchema,
  removeCurrencySchema,
} from '@remnant/shared'

export type CurrencyDB = z.infer<typeof currencyDBSchema>

export type ExchangeRateDB = z.infer<typeof exchangeRateDBSchema>

export type GetCurrencyPayload = z.output<typeof getCurrencySchema>
export function parseGetCurrency(x: unknown): GetCurrencyPayload {
  return getCurrencySchema.parse(x)
}

export type CreateCurrencyPayload = z.output<typeof createCurrencySchema>
export function parseCreateCurrency(x: unknown): CreateCurrencyPayload {
  return createCurrencySchema.parse(x)
}

export type EditCurrencyPayload = z.output<typeof editCurrencySchema>
export function parseEditCurrency(x: unknown): EditCurrencyPayload {
  return editCurrencySchema.parse(x)
}

export type RemoveCurrencyPayload = z.output<typeof removeCurrencySchema>
export function parseRemoveCurrency(x: unknown): RemoveCurrencyPayload {
  return removeCurrencySchema.parse(x)
}

export type GetExchangeRatesPayload = z.output<typeof getExchangeRatesSchema>
export function parseGetExchangeRates(x: unknown): GetExchangeRatesPayload {
  return getExchangeRatesSchema.parse(x)
}

export type EditExchangeRatePayload = z.output<typeof editExchangeRateSchema>
export function parseEditExchangeRate(x: unknown): EditExchangeRatePayload {
  return editExchangeRateSchema.parse(x)
}

export type GetCurrenciesRepoPayload = GetCurrencyPayload
export interface GetCurrenciesRepoResult { items: CurrencyDTO[], total: number, page: number, pageSize: number }

export type CreateCurrenciesRepoPayload = CreateCurrencyPayload

export type EditCurrenciesRepoPayload = EditCurrencyPayload

export type GetExchangeRatesRepoPayload = GetExchangeRatesPayload
export interface GetExchangeRatesRepoResult { items: ExchangeRateDTOPopulated[], total: number, page: number, pageSize: number }

export type EditExchangeRatesRepoPayload = EditExchangeRatePayload
