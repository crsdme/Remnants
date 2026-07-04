export interface Money {
  currencyId: string
  minor: number
}

export function toMinor(amountStr: string | number, scale: number): number {
  const n = typeof amountStr === 'number' ? amountStr.toString() : amountStr
  const [int, frac = ''] = n.split('.')
  const padded = (frac + '0'.repeat(scale)).slice(0, scale)
  return Number.parseInt(int) * 10 ** scale + Number.parseInt(padded || '0')
}

export function fromMinor(minor: number, scale: number): string {
  const sign = minor < 0 ? '-' : ''
  const abs = Math.abs(minor).toString().padStart(scale + 1, '0')
  const head = abs.slice(0, -scale) || '0'
  const tail = abs.slice(-scale)
  return `${sign}${head}.${tail}`
}

export function add(a: Money, b: Money): Money {
  if (a.currencyId !== b.currencyId)
    throw new Error('currency mismatch')
  return { currencyId: a.currencyId, minor: a.minor + b.minor }
}

export function sub(a: Money, b: Money): Money {
  if (a.currencyId !== b.currencyId)
    throw new Error('currency mismatch')
  return { currencyId: a.currencyId, minor: a.minor - b.minor }
}

export function cmp(a: Money, b: Money): number {
  if (a.currencyId !== b.currencyId)
    throw new Error('currency mismatch')
  return Math.sign(a.minor - b.minor)
}

export function defaultPaymentEpsilon(scale: number): number {
  return 10 ** (1 - scale)
}

export function resolvePaymentEpsilon(currency: { scale: number, paymentEpsilon?: number | null }): number {
  return currency.paymentEpsilon ?? defaultPaymentEpsilon(currency.scale)
}
