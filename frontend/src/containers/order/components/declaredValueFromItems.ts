export interface ConvertibleLine {
  lineQuantity?: number
  selectedPrice?: number
  price?: number
  selectedCurrencyId?: string
  currency?: { id?: string }
}

interface ExchangeRateLike {
  fromCurrency: { id: string }
  toCurrency: { id: string }
  rate: number
}

export function findExchangeRate(
  rates: ExchangeRateLike[],
  fromCurrencyId: string,
  toCurrencyId: string,
): number | undefined {
  if (fromCurrencyId === toCurrencyId)
    return 1

  const direct = rates.find(rate => rate.fromCurrency.id === fromCurrencyId && rate.toCurrency.id === toCurrencyId)
  if (direct != null && direct.rate > 0)
    return direct.rate

  const reverse = rates.find(rate => rate.fromCurrency.id === toCurrencyId && rate.toCurrency.id === fromCurrencyId)
  if (reverse != null && reverse.rate > 0)
    return 1 / reverse.rate

  return undefined
}

export function declaredValueFromItems(
  items: ConvertibleLine[] | undefined,
  targetCurrencyId: string | undefined,
  rates: ExchangeRateLike[],
): number | undefined {
  if (targetCurrencyId == null || targetCurrencyId === '' || items == null || items.length === 0)
    return 0

  let total = 0
  for (const item of items) {
    const quantity = item.lineQuantity ?? 0
    if (quantity <= 0)
      continue

    const currencyId = item.selectedCurrencyId || item.currency?.id
    if (currencyId == null || currencyId === '')
      return undefined

    const rate = findExchangeRate(rates, currencyId, targetCurrencyId)
    if (rate == null)
      return undefined

    const unitPrice = item.selectedPrice ?? item.price ?? 0
    total += quantity * unitPrice * rate
  }

  return Math.round(total * 100) / 100
}

export function itemsConversionKey(items: ConvertibleLine[] | undefined): string {
  if (items == null || items.length === 0)
    return ''

  return items
    .map(item => [
      item.lineQuantity ?? 0,
      item.selectedPrice ?? item.price ?? 0,
      item.selectedCurrencyId || item.currency?.id || '',
    ].join(':'))
    .join('|')
}
