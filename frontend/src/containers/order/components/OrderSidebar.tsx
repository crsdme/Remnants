import type { ReactNode } from 'react'
import type { OrderPaymentListItem } from './OrderPaymentsList'
import { FileText } from 'lucide-react'
import { useCurrencyQuery } from '@/api/hooks'
import { Button, Separator } from '@/components/ui'
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
  const { currencies } = useCurrencyQuery({ pagination: { full: true } })

  const currencySymbolsById = currencies.reduce((acc: Record<string, string>, currency) => {
    acc[currency.id] = currency.symbols?.[language] || currency.id
    return acc
  }, {})

  const getSymbol = (item: OrderSidebarItem, currencyId: string) => {
    return currencySymbolsById[currencyId]
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

  const paidByCurrency = payments.reduce((acc, payment) => {
    const currencyId = payment.currency.id
    const symbol = (currencyId && currencySymbolsById[currencyId])
      || payment.currency.symbols?.[language]
      || currencyId
      || ''
    if (!symbol)
      return acc

    acc[symbol] = (acc[symbol] ?? 0) + (payment.amount ?? 0)
    return acc
  }, {} as Record<string, number>)

  const symbols = new Set([
    ...Object.keys(totalsByCurrency),
    ...Object.keys(paidByCurrency),
  ])

  const debtByCurrency: Record<string, number> = {}
  const overpaymentByCurrency: Record<string, number> = {}

  for (const symbol of symbols) {
    const total = totalsByCurrency[symbol] ?? 0
    const paid = paidByCurrency[symbol] ?? 0
    const diff = total - paid
    if (diff > 0)
      debtByCurrency[symbol] = diff
    else if (diff < 0)
      overpaymentByCurrency[symbol] = -diff
  }

  const subtotalEntries = Object.entries(subtotalsByCurrency)
  const discountEntries = Object.entries(discountsByCurrency).filter(([, sum]) => sum > 0)
  const totalEntries = Object.entries(totalsByCurrency)
  const paidEntries = Object.entries(paidByCurrency)
  const debtEntries = Object.entries(debtByCurrency)
  const overpaymentEntries = Object.entries(overpaymentByCurrency)
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
