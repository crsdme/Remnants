import { resolvePaymentEpsilon, toMinor } from '@/utils/money'

export type PaymentStatus = 'paid' | 'unpaid' | 'partially_paid' | 'overpaid'

export interface MoneyLike {
  currency: string
  totalMinor: number
  scale: number
  exchangeRateToCalculationCurrency?: number
}

export interface CalculationCurrency {
  currency: string
  scale: number
  paymentEpsilon: number
}

export function buildPricesByCurrency(
  items: { currency: string, price: number, quantity: number }[],
  currencies: { id: string, scale: number }[],
): MoneyLike[] {
  return Object.values(
    items.reduce<Record<string, MoneyLike>>((acc, item) => {
      const currencyDoc = currencies.find(c => c.id === item.currency)

      if (!currencyDoc)
        throw new Error(`Currency not found: ${item.currency}`)

      if (acc[item.currency] === undefined) {
        acc[item.currency] = {
          currency: item.currency,
          totalMinor: 0,
          scale: currencyDoc.scale,
        }
      }

      acc[item.currency].totalMinor += toMinor(item.price, currencyDoc.scale) * item.quantity

      return acc
    }, {}),
  )
}

export function buildPaymentsByCurrency(
  payments: { currency: string, amount: number }[],
  currencies: { id: string, scale: number }[],
): MoneyLike[] {
  return Object.values(
    payments.reduce<Record<string, MoneyLike>>((acc, payment) => {
      const currencyDoc = currencies.find(c => c.id === payment.currency)

      if (!currencyDoc)
        throw new Error(`Currency not found: ${payment.currency}`)

      if (acc[payment.currency] === undefined) {
        acc[payment.currency] = {
          currency: payment.currency,
          totalMinor: 0,
          scale: currencyDoc.scale,
        }
      }

      acc[payment.currency].totalMinor += toMinor(payment.amount, currencyDoc.scale)

      return acc
    }, {}),
  )
}

export function resolveCalculationCurrency(
  payments: { currency: string }[],
  prices: { currency: string }[],
): string {
  if (payments.length > 0)
    return payments[0].currency

  return prices[0]?.currency ?? ''
}

export function toCalculationMinor(
  value: MoneyLike,
  calculationCurrency: CalculationCurrency,
): number {
  const amountMajor = value.totalMinor / (10 ** value.scale)

  if (value.currency === calculationCurrency.currency)
    return toMinor(amountMajor, calculationCurrency.scale)

  const rate = value.exchangeRateToCalculationCurrency

  if (rate === undefined || rate <= 0) {
    throw new Error(
      `exchangeRateToCalculationCurrency is required for ${value.currency} -> ${calculationCurrency.currency}`,
    )
  }

  return toMinor(amountMajor * rate, calculationCurrency.scale)
}

export function getPaymentStatus(
  prices: MoneyLike[],
  payments: MoneyLike[],
  calculationCurrency: CalculationCurrency,
): PaymentStatus {
  const epsilonMinor = toMinor(calculationCurrency.paymentEpsilon, calculationCurrency.scale)

  const orderTotalMinor = prices.reduce(
    (sum, price) => sum + toCalculationMinor(price, calculationCurrency),
    0,
  )

  const paidTotalMinor = payments.reduce(
    (sum, payment) => sum + toCalculationMinor(payment, calculationCurrency),
    0,
  )

  const balanceMinor = orderTotalMinor - paidTotalMinor

  if (paidTotalMinor <= 0)
    return 'unpaid'

  if (Math.abs(balanceMinor) <= epsilonMinor)
    return 'paid'

  if (balanceMinor > epsilonMinor)
    return 'partially_paid'

  return 'overpaid'
}

export function buildCalculationCurrency(
  currency: { id?: string, _id?: string, scale: number, paymentEpsilon?: number | null },
): CalculationCurrency {
  const currencyId = currency.id ?? currency._id ?? ''

  return {
    currency: currencyId,
    scale: currency.scale,
    paymentEpsilon: resolvePaymentEpsilon(currency),
  }
}
