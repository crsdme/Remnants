import type { CurrencyDTO, ExchangeRateDTO } from '@remnant/shared'
import type { CurrencyDB, ExchangeRateDB } from '@/types/'
import { resolvePaymentEpsilon } from '@/utils/money'

export function mapCurrencyToDTO(currency: CurrencyDB): CurrencyDTO {
  return {
    id: currency._id,
    names: currency.names,
    symbols: currency.symbols,
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
    fromCurrency: exchangeRate.fromCurrency,
    toCurrency: exchangeRate.toCurrency,
    rate: exchangeRate.rate,
    comment: exchangeRate.comment,
    createdAt: exchangeRate.createdAt,
    updatedAt: exchangeRate.updatedAt,
  }
}
