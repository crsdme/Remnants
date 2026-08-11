import type { CurrencyDTO, ExchangeRateDTO } from '@remnant/shared'
import type { CurrencyDB, ExchangeRateDB } from '@/types/'
import { resolvePaymentEpsilon } from '@/utils/money'

function languageMapToObject(
  value: CurrencyDB['names'] | Map<string, string>,
): CurrencyDTO['names'] {
  if (value instanceof Map)
    return Object.fromEntries(value.entries())

  return value
}

export function mapCurrencyToDTO(currency: CurrencyDB): CurrencyDTO {
  return {
    id: currency._id,
    names: languageMapToObject(currency.names),
    symbols: languageMapToObject(currency.symbols),
    scale: currency.scale,
    paymentEpsilon: resolvePaymentEpsilon(currency),
    priority: currency.priority,
    active: currency.active,
    createdAt: currency.createdAt,
    updatedAt: currency.updatedAt,
  }
}

export function mapExchangeRateToDTO(exchangeRate: ExchangeRateDB): ExchangeRateDTO {
  return {
    id: exchangeRate._id,
    fromCurrencyId: exchangeRate.fromCurrencyId,
    toCurrencyId: exchangeRate.toCurrencyId,
    rate: exchangeRate.rate,
    comment: exchangeRate.comment,
    createdAt: exchangeRate.createdAt,
    updatedAt: exchangeRate.updatedAt,
  }
}
