import type { CurrencyDTO, ExchangeRateDTO, ExchangeRateDTOPopulated } from '@remnant/shared'
import type { CurrencyDB, ExchangeRateDB } from '@/types/'

export function mapCurrencyToDTO(currency: CurrencyDB): CurrencyDTO {
  return {
    id: currency._id,
    names: currency.names,
    symbols: currency.symbols,
    scale: currency.scale,
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
