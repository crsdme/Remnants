import type { ReactNode } from 'react'
import type { OrderPaymentListItem } from './OrderPaymentsList'
import { FileText } from 'lucide-react'
import { useCurrencyExcangeRateQuery, useCurrencyQuery } from '@/api/hooks'
import { Button, Separator } from '@/components/ui'
import { formatMinor, toMinor } from '@/utils/helpers'
import { useLocale } from '@/utils/hooks'
import { OrderPaymentsList } from './OrderPaymentsList'

export const ORDER_INFORMATION_FORM_ID = 'order-information-form'

interface OrderSidebarItem {
  lineQuantity?: number
  selectedPrice?: number
  basePrice?: number
  manualPrice?: number
  discountAmount?: number
  discountPercent?: number
  selectedCurrencyId?: string
  currency?: {
    id?: string
    symbols?: { [key: string]: string }
  }
}

interface OrderSidebarProps {
  items: OrderSidebarItem[]
  payments: OrderPaymentListItem[]
  titlePrefix: 'create-order' | 'edit-order' | 'view-order'
  isLoading?: boolean
  onAddPayment?: () => void
  onRemovePayment?: (id: string) => void
  actions?: ReactNode
}

interface CurrencyMeta {
  id: string
  scale: number
  paymentEpsilon: number
  symbol: string
}

interface ExchangeRateLike {
  fromCurrency: { id: string }
  toCurrency: { id: string }
  rate: number
}

function formatAmount(value: number) {
  const rounded = Math.round(value * 100) / 100
  return Number(rounded).toString()
}

function getCurrencyId(item: OrderSidebarItem) {
  return item.selectedCurrencyId || item.currency?.id
}

function getUnitPriceBeforeDiscount(item: OrderSidebarItem) {
  return item.manualPrice ?? item.basePrice ?? item.selectedPrice ?? 0
}

function getUnitPriceAfterDiscount(item: OrderSidebarItem) {
  return item.selectedPrice ?? getUnitPriceBeforeDiscount(item)
}

function defaultPaymentEpsilon(scale: number) {
  return 10 ** (1 - scale)
}

function resolvePaymentEpsilon(scale: number, paymentEpsilon?: number | null) {
  return paymentEpsilon ?? defaultPaymentEpsilon(scale)
}

function findExchangeRate(
  rates: ExchangeRateLike[],
  fromCurrencyId: string,
  toCurrencyId: string,
): number | undefined {
  if (fromCurrencyId === toCurrencyId)
    return 1

  return rates.find(
    rate => rate.fromCurrency.id === fromCurrencyId && rate.toCurrency.id === toCurrencyId,
  )?.rate
}

function toCalculationMinor(
  amountMajor: number,
  fromCurrencyId: string,
  calculationCurrency: CurrencyMeta,
  rate: number,
) {
  if (fromCurrencyId === calculationCurrency.id)
    return toMinor(amountMajor, calculationCurrency.scale)

  return toMinor(amountMajor * rate, calculationCurrency.scale)
}

function computeBalanceEntries(params: {
  totalsByCurrencyId: Record<string, number>
  paidByCurrencyId: Record<string, number>
  currenciesById: Record<string, CurrencyMeta>
  exchangeRates: ExchangeRateLike[]
  calculationCurrencyId: string
}): { debtEntries: [string, number][], overpaymentEntries: [string, number][] } {
  const {
    totalsByCurrencyId,
    paidByCurrencyId,
    currenciesById,
    exchangeRates,
    calculationCurrencyId,
  } = params

  const resolveCurrency = (currencyId: string): CurrencyMeta => {
    const known = currenciesById[currencyId]
    if (known)
      return known

    const scale = 2
    return {
      id: currencyId,
      scale,
      paymentEpsilon: defaultPaymentEpsilon(scale),
      symbol: currencyId,
    }
  }

  const calculationCurrency = resolveCurrency(calculationCurrencyId)
  const currencyIds = new Set([
    ...Object.keys(totalsByCurrencyId),
    ...Object.keys(paidByCurrencyId),
  ])

  let orderTotalMinor = 0
  let paidTotalMinor = 0
  let canConvert = true

  for (const currencyId of currencyIds) {
    const rate = findExchangeRate(exchangeRates, currencyId, calculationCurrencyId)
    if (rate === undefined || rate <= 0) {
      canConvert = false
      break
    }

    orderTotalMinor += toCalculationMinor(
      totalsByCurrencyId[currencyId] ?? 0,
      currencyId,
      calculationCurrency,
      rate,
    )
    paidTotalMinor += toCalculationMinor(
      paidByCurrencyId[currencyId] ?? 0,
      currencyId,
      calculationCurrency,
      rate,
    )
  }

  if (canConvert) {
    const epsilonMinor = toMinor(calculationCurrency.paymentEpsilon, calculationCurrency.scale)
    const balanceMinor = orderTotalMinor - paidTotalMinor

    if (Math.abs(balanceMinor) <= epsilonMinor)
      return { debtEntries: [], overpaymentEntries: [] }

    const amountMajor = Number(formatMinor(Math.abs(balanceMinor), calculationCurrency.scale))
    const entry: [string, number] = [calculationCurrency.symbol, amountMajor]

    if (balanceMinor > epsilonMinor)
      return { debtEntries: [entry], overpaymentEntries: [] }

    return { debtEntries: [], overpaymentEntries: [entry] }
  }

  // Fallback without FX: compare per currency and ignore "overpayment" in currencies
  // that have no order total (covers cross-currency payments until rates load).
  const debtEntries: [string, number][] = []
  const overpaymentEntries: [string, number][] = []

  for (const currencyId of currencyIds) {
    const currency = resolveCurrency(currencyId)
    const total = totalsByCurrencyId[currencyId] ?? 0
    const paid = paidByCurrencyId[currencyId] ?? 0
    const diff = total - paid
    const epsilon = currency.paymentEpsilon

    if (Math.abs(diff) <= epsilon)
      continue

    if (diff > epsilon)
      debtEntries.push([currency.symbol, diff])
    else if (total > 0)
      overpaymentEntries.push([currency.symbol, -diff])
  }

  return { debtEntries, overpaymentEntries }
}

export function OrderSidebar({
  items,
  payments,
  titlePrefix,
  isLoading,
  onAddPayment,
  onRemovePayment,
  actions,
}: OrderSidebarProps) {
  const { t, language } = useLocale()
  const { currencies } = useCurrencyQuery({ pagination: { current: 1, pageSize: 1000, full: true } })
  const { items: exchangeRates } = useCurrencyExcangeRateQuery({
    pagination: { current: 1, pageSize: 1000, full: true },
  })

  const currenciesById = currencies.reduce((acc: Record<string, CurrencyMeta>, currency) => {
    const scale = currency.scale ?? 2
    acc[currency.id] = {
      id: currency.id,
      scale,
      paymentEpsilon: resolvePaymentEpsilon(scale, currency.paymentEpsilon),
      symbol: currency.symbols?.[language] || currency.id,
    }
    return acc
  }, {})

  const getSymbol = (item: OrderSidebarItem, currencyId: string) => {
    return currenciesById[currencyId]?.symbol
      || item.currency?.symbols?.[language]
      || currencyId
  }

  const itemsCount = items.reduce((sum, item) => sum + (item.lineQuantity ?? 0), 0)

  const subtotalsByCurrency = items.reduce((acc, item) => {
    const quantity = item.lineQuantity ?? 0
    const currencyId = getCurrencyId(item)
    if (!currencyId)
      return acc

    const symbol = getSymbol(item, currencyId)
    acc[symbol] = (acc[symbol] ?? 0) + quantity * getUnitPriceBeforeDiscount(item)
    return acc
  }, {} as Record<string, number>)

  const discountsByCurrency = items.reduce((acc, item) => {
    const quantity = item.lineQuantity ?? 0
    const currencyId = getCurrencyId(item)
    if (!currencyId)
      return acc

    const before = getUnitPriceBeforeDiscount(item)
    const after = getUnitPriceAfterDiscount(item)
    const unitDiscount = Math.max(before - after, 0)
    if (unitDiscount <= 0)
      return acc

    const symbol = getSymbol(item, currencyId)
    acc[symbol] = (acc[symbol] ?? 0) + quantity * unitDiscount
    return acc
  }, {} as Record<string, number>)

  const totalsByCurrency = items.reduce((acc, item) => {
    const quantity = item.lineQuantity ?? 0
    const currencyId = getCurrencyId(item)
    if (!currencyId)
      return acc

    const symbol = getSymbol(item, currencyId)
    acc[symbol] = (acc[symbol] ?? 0) + quantity * getUnitPriceAfterDiscount(item)
    return acc
  }, {} as Record<string, number>)

  const totalsByCurrencyId = items.reduce((acc, item) => {
    const quantity = item.lineQuantity ?? 0
    const currencyId = getCurrencyId(item)
    if (!currencyId)
      return acc

    acc[currencyId] = (acc[currencyId] ?? 0) + quantity * getUnitPriceAfterDiscount(item)
    return acc
  }, {} as Record<string, number>)

  const paidByCurrency = payments.reduce((acc, payment) => {
    const currencyId = payment.currency.id
    const symbol = (currencyId && currenciesById[currencyId]?.symbol)
      || payment.currency.symbols?.[language]
      || currencyId
      || ''
    if (!symbol)
      return acc

    acc[symbol] = (acc[symbol] ?? 0) + (payment.amount ?? 0)
    return acc
  }, {} as Record<string, number>)

  const paidByCurrencyId = payments.reduce((acc, payment) => {
    const currencyId = payment.currency.id
    if (!currencyId)
      return acc

    acc[currencyId] = (acc[currencyId] ?? 0) + (payment.amount ?? 0)
    return acc
  }, {} as Record<string, number>)

  const firstPaymentCurrencyId = payments.find(payment => payment.currency.id)?.currency.id
  const firstTotalCurrencyId = Object.keys(totalsByCurrencyId)[0]
  const calculationCurrencyId = firstPaymentCurrencyId || firstTotalCurrencyId || ''

  const { debtEntries, overpaymentEntries } = calculationCurrencyId
    ? computeBalanceEntries({
        totalsByCurrencyId,
        paidByCurrencyId,
        currenciesById,
        exchangeRates,
        calculationCurrencyId,
      })
    : { debtEntries: [], overpaymentEntries: [] }

  const subtotalEntries = Object.entries(subtotalsByCurrency)
  const discountEntries = Object.entries(discountsByCurrency).filter(([, sum]) => sum > 0)
  const totalEntries = Object.entries(totalsByCurrency)
  const paidEntries = Object.entries(paidByCurrency)
  const hasDiscount = discountEntries.length > 0
  const hasOverpayment = overpaymentEntries.length > 0
  const showDebtRow = debtEntries.length > 0 || !hasOverpayment

  return (
    <aside className="flex flex-col gap-4 lg:sticky lg:top-4">
      <div className="space-y-3 rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2">
          <FileText className="size-5 shrink-0" />
          <p className="text-lg font-bold">{t(`page.${titlePrefix}.form.order-total`)}</p>
          <Separator className="flex-1" />
        </div>

        <div className="flex items-start justify-between gap-3 text-sm">
          <span className="text-muted-foreground">
            {t(`page.${titlePrefix}.form.items-count`, { count: itemsCount })}
          </span>
          <div className="flex flex-col items-end gap-0.5 tabular-nums">
            {subtotalEntries.length > 0
              ? subtotalEntries.map(([symbol, sum]) => (
                  <span key={symbol}>
                    {formatAmount(sum)}
                    {' '}
                    {symbol}
                  </span>
                ))
              : <span>0</span>}
          </div>
        </div>

        {hasDiscount && (
          <div className="flex items-start justify-between gap-3 text-sm">
            <span className="text-muted-foreground">
              {t(`page.${titlePrefix}.form.discount`)}
            </span>
            <div className="flex flex-col items-end gap-0.5 tabular-nums text-emerald-700">
              {discountEntries.map(([symbol, sum]) => (
                <span key={symbol}>
                  -
                  {formatAmount(sum)}
                  {' '}
                  {symbol}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-start justify-between gap-3 border-t pt-3">
          <span className="font-semibold">{t(`page.${titlePrefix}.form.total`)}</span>
          <div className="flex flex-col items-end gap-0.5 text-base font-semibold tabular-nums">
            {totalEntries.length > 0
              ? totalEntries.map(([symbol, sum]) => (
                  <span key={symbol}>
                    {formatAmount(sum)}
                    {' '}
                    {symbol}
                  </span>
                ))
              : <span>0</span>}
          </div>
        </div>

        <div className="flex items-start justify-between gap-3 text-sm">
          <span className="text-muted-foreground">
            {t(`page.${titlePrefix}.form.paid`)}
          </span>
          <div className="flex flex-col items-end gap-0.5 tabular-nums">
            {paidEntries.length > 0
              ? paidEntries.map(([symbol, sum]) => (
                  <span key={symbol}>
                    {formatAmount(sum)}
                    {' '}
                    {symbol}
                  </span>
                ))
              : <span>0</span>}
          </div>
        </div>

        {showDebtRow && (
          <div className="flex items-start justify-between gap-3 text-sm">
            <span className="text-muted-foreground">
              {t(`page.${titlePrefix}.form.debt`)}
            </span>
            <div className={`flex flex-col items-end gap-0.5 tabular-nums ${debtEntries.length > 0 ? 'text-destructive' : ''}`}>
              {debtEntries.length > 0
                ? debtEntries.map(([symbol, sum]) => (
                    <span key={symbol}>
                      {formatAmount(sum)}
                      {' '}
                      {symbol}
                    </span>
                  ))
                : <span>0</span>}
            </div>
          </div>
        )}

        {hasOverpayment && (
          <div className="flex items-start justify-between gap-3 text-sm">
            <span className="text-muted-foreground">
              {t(`page.${titlePrefix}.form.overpayment`)}
            </span>
            <div className="flex flex-col items-end gap-0.5 tabular-nums text-amber-600">
              {overpaymentEntries.map(([symbol, sum]) => (
                <span key={symbol}>
                  {formatAmount(sum)}
                  {' '}
                  {symbol}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-card p-4">
        <OrderPaymentsList
          payments={payments}
          title={t(`page.${titlePrefix}.form.payments`)}
          addLabel={t('button.add')}
          onAdd={onAddPayment}
          onRemove={onRemovePayment}
          disabled={isLoading}
        />
      </div>

      {actions && (
        <div className="flex flex-col gap-2">
          {actions}
        </div>
      )}
    </aside>
  )
}

export function OrderSidebarSubmitButton({
  formId = ORDER_INFORMATION_FORM_ID,
  isLoading,
  label,
}: {
  formId?: string
  isLoading?: boolean
  label: string
}) {
  return (
    <Button
      type="submit"
      form={formId}
      disabled={isLoading}
      loading={isLoading}
      className="w-full"
    >
      {label}
    </Button>
  )
}
