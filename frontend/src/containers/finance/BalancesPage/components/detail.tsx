import type { BalanceComputedDTO, CurrencyDTO } from '@remnant/shared'
import { useMemo } from 'react'

import { useCashregisterQuery } from '@/api/hooks/cashregister/useCashregisterQuery'
import { useClientQuery } from '@/api/hooks/client/useClientQuery'
import { useOrderQuery } from '@/api/hooks/order/useOrderQuery'
import { useProcurementQuery } from '@/api/hooks/procurement/useProcurementQuery'
import { useSupplierQuery } from '@/api/hooks/supplier/useSupplierQuery'
import { useWarehouseQuery } from '@/api/hooks/warehouse/useWarehouseQuery'
import { fromMinor } from '@/utils/helpers'
import { useLocale } from '@/utils/hooks'
import { cn } from '@/utils/lib/utils'
import { useBalanceContext } from '../context'

type Sign = 'plus' | 'minus' | 'net'

function uniqueIds(ids: Array<string | null | undefined>) {
  return [...new Set(ids.filter((id): id is string => Boolean(id)))]
}

function langName(names?: Partial<Record<'en' | 'ru', string>> | null, language?: string) {
  if (!names)
    return null
  const lang = (language ?? 'en') as 'en' | 'ru'
  return names[lang] ?? names.en ?? names.ru ?? null
}

function formatPersonName(person?: { name?: string, middleName?: string, lastName?: string } | null) {
  if (!person)
    return null
  return [person.name, person.middleName, person.lastName].filter(Boolean).join(' ') || null
}

function formatAmount(
  minorAmount: number,
  currencyId: string,
  currencies: CurrencyDTO[],
  language: string,
  sign: Sign,
) {
  const currency = currencies.find(item => item.id === currencyId)
  const scale = currency?.scale ?? 2
  const symbol = currency?.symbols?.[language as 'en' | 'ru'] ?? currency?.symbols?.en ?? ''
  const signed = sign === 'minus' ? -Math.abs(minorAmount) : minorAmount
  const value = fromMinor(Math.abs(signed), scale)
  if (sign === 'net')
    return `${signed < 0 ? '−' : ''}${value} ${symbol}`.trim()
  return `${signed < 0 ? '−' : '+'}${value} ${symbol}`.trim()
}

function amountClass(sign: Sign, minorAmount = 0) {
  const signed = sign === 'minus' ? -Math.abs(minorAmount) : minorAmount
  if (sign === 'net')
    return 'font-semibold'
  if (signed < 0)
    return 'text-destructive'
  return 'text-emerald-600 dark:text-emerald-400'
}

function Section({
  title,
  sign,
  rows,
}: {
  title: string
  sign: Sign
  rows: Array<{ key: string, label: string, totals: Array<{ currencyId: string, minorAmount: number }> }>
}) {
  const { t, language } = useLocale()
  const { currencies } = useBalanceContext()

  if (rows.length === 0)
    return null

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-medium">{title}</h4>
        <span className={cn('text-xs font-medium tabular-nums', sign === 'minus' ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-400')}>
          {sign === 'plus' ? t('page.balances.detail.signPlus') : t('page.balances.detail.signMinus')}
        </span>
      </div>
      <ul className="divide-y rounded-md border">
        {rows.map(row => (
          <li key={row.key} className="flex items-start justify-between gap-4 px-3 py-2 text-sm">
            <span className="min-w-0 text-muted-foreground">{row.label}</span>
            <span className={cn('shrink-0 text-right tabular-nums', amountClass(sign, Number(row.totals[0]?.minorAmount) || 0))}>
              {row.totals.map(total => formatAmount(
                Number(total.minorAmount) || 0,
                total.currencyId,
                currencies,
                language,
                sign,
              )).join(', ')}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function BalanceDetail({ balance }: { balance: BalanceComputedDTO }) {
  const { t, language } = useLocale()
  const { currencies } = useBalanceContext()

  const cashregisterIds = useMemo(
    () => uniqueIds((balance.cashregisterBalance ?? []).map(row => row.cashregisterId)),
    [balance.cashregisterBalance],
  )
  const warehouseIds = useMemo(
    () => uniqueIds([
      ...(balance.warehouseBalance ?? []).map(row => row.warehouseId),
      ...(balance.transitBalance ?? []).map(row => row.fromWarehouseId),
    ]),
    [balance.transitBalance, balance.warehouseBalance],
  )
  const supplierIds = useMemo(
    () => uniqueIds([
      ...(balance.orderedNotReceivedBalance ?? []).map(row => row.supplierId),
      ...(balance.prepaidBalance ?? []).map(row => row.supplierId),
      ...(balance.supplierDebtBalance ?? []).map(row => row.supplierId),
    ]),
    [balance.orderedNotReceivedBalance, balance.prepaidBalance, balance.supplierDebtBalance],
  )
  const procurementIds = useMemo(
    () => uniqueIds([
      ...(balance.orderedNotReceivedBalance ?? []).map(row => row.procurementId),
      ...(balance.prepaidBalance ?? []).map(row => row.procurementId),
      ...(balance.supplierDebtBalance ?? []).map(row => row.procurementId),
    ]),
    [balance.orderedNotReceivedBalance, balance.prepaidBalance, balance.supplierDebtBalance],
  )
  const orderIds = useMemo(
    () => uniqueIds((balance.receivableBalance ?? []).map(row => row.orderId)),
    [balance.receivableBalance],
  )
  const clientIds = useMemo(
    () => uniqueIds((balance.receivableBalance ?? []).map(row => row.clientId)),
    [balance.receivableBalance],
  )

  const { cashregisters } = useCashregisterQuery(
    { pagination: { pageSize: 500 }, filters: {} },
    { options: { enabled: cashregisterIds.length > 0 } },
  )
  const { warehouses } = useWarehouseQuery(
    { pagination: { full: true }, filters: { ids: warehouseIds } },
    { options: { enabled: warehouseIds.length > 0 } },
  )
  const { suppliers } = useSupplierQuery(
    { pagination: { full: true }, filters: { ids: supplierIds } },
    { options: { enabled: supplierIds.length > 0 } },
  )
  const { procurements } = useProcurementQuery(
    { pagination: { full: true }, filters: { ids: procurementIds } },
    { options: { enabled: procurementIds.length > 0 } },
  )
  const { orders } = useOrderQuery(
    { pagination: { full: true }, filters: { ids: orderIds } },
    { options: { enabled: orderIds.length > 0 } },
  )
  const { clients } = useClientQuery(
    { pagination: { full: true }, filters: { ids: clientIds } },
    { options: { enabled: clientIds.length > 0 } },
  )

  const cashregisterName = (id: string) => {
    const item = cashregisters.find(row => row.id === id)
    return langName(item?.names, language) ?? id
  }
  const warehouseName = (id: string | null | undefined) => {
    if (!id)
      return t('page.balances.detail.unknownWarehouse')
    const item = warehouses.find(row => row.id === id)
    return langName(item?.names, language) ?? id
  }
  const supplierName = (id: string | null | undefined) => {
    if (!id)
      return t('page.balances.detail.unknownSupplier')
    const item = suppliers.find(row => row.id === id)
    return item?.name ?? id
  }
  const procurementLabel = (procurementId?: string, supplierId?: string) => {
    if (procurementId) {
      const procurement = procurements.find(row => row.id === procurementId)
      if (procurement) {
        const supplier = procurement.supplier?.name ?? supplierName(procurement.supplierId ?? supplierId)
        return t('page.balances.detail.procurementLabel', { seq: procurement.seq, supplier })
      }
    }
    if (supplierId)
      return supplierName(supplierId)
    return procurementId ?? '—'
  }
  const orderLabel = (orderId: string, clientId?: string | null) => {
    const order = orders.find(row => row.id === orderId) as
      | { seq?: number, client?: { name?: string, middleName?: string, lastName?: string } | string | null }
      | undefined
    const client = clients.find(row => row.id === (clientId ?? ''))
    const clientFromOrder = order && typeof order.client === 'object' ? order.client : null
    const clientLabel = formatPersonName(client)
      ?? formatPersonName(clientFromOrder)
      ?? t('page.balances.detail.unknownClient')
    if (order?.seq != null)
      return t('page.balances.detail.orderLabel', { seq: order.seq, client: clientLabel })
    return clientLabel
  }

  const assetSections = [
    {
      title: t('page.balances.detail.cash'),
      sign: 'plus' as const,
      rows: (balance.cashregisterBalance ?? []).map(row => ({
        key: row.cashregisterId,
        label: cashregisterName(row.cashregisterId),
        totals: row.totals,
      })),
    },
    {
      title: t('page.balances.detail.warehouse'),
      sign: 'plus' as const,
      rows: (balance.warehouseBalance ?? []).map(row => ({
        key: row.warehouseId,
        label: warehouseName(row.warehouseId),
        totals: row.totals,
      })),
    },
    {
      title: t('page.balances.detail.transit'),
      sign: 'plus' as const,
      rows: (balance.transitBalance ?? []).map(row => ({
        key: row.warehouseTransactionId,
        label: t('page.balances.detail.transitLabel', { warehouse: warehouseName(row.fromWarehouseId) }),
        totals: row.totals,
      })),
    },
    {
      title: t('page.balances.detail.orderedNotReceived'),
      sign: 'plus' as const,
      rows: (balance.orderedNotReceivedBalance ?? []).map(row => ({
        key: row.procurementId,
        label: procurementLabel(row.procurementId, row.supplierId),
        totals: row.totals,
      })),
    },
    {
      title: t('page.balances.detail.prepaid'),
      sign: 'plus' as const,
      rows: (balance.prepaidBalance ?? []).map(row => ({
        key: row.procurementId ?? row.supplierId ?? 'prepaid',
        label: procurementLabel(row.procurementId, row.supplierId),
        totals: row.totals,
      })),
    },
    {
      title: t('page.balances.detail.receivable'),
      sign: 'plus' as const,
      rows: (balance.receivableBalance ?? []).map(row => ({
        key: row.orderId,
        label: orderLabel(row.orderId, row.clientId),
        totals: row.totals,
      })),
    },
  ]

  const liabilitySections = [
    {
      title: t('page.balances.detail.supplierDebt'),
      sign: 'minus' as const,
      rows: (balance.supplierDebtBalance ?? []).map(row => ({
        key: row.procurementId,
        label: procurementLabel(row.procurementId, row.supplierId),
        totals: row.totals,
      })),
    },
  ]

  const visibleAssets = assetSections.filter(section => section.rows.length > 0)
  const visibleLiabilities = liabilitySections.filter(section => section.rows.length > 0)

  return (
    <div className="space-y-6 py-2">
      <div className="rounded-lg border bg-muted/30 p-4">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">
          {t('page.balances.detail.total')}
        </div>
        <div className="mt-2 space-y-1">
          {(balance.totalBalances ?? []).length === 0
            ? <p className="text-sm text-muted-foreground">{t('page.balances.detail.empty')}</p>
            : (balance.totalBalances ?? []).map(total => (
                <div key={total.currencyId} className="text-xl font-semibold tabular-nums">
                  {formatAmount(Number(total.minorAmount) || 0, total.currencyId, currencies, language, 'net')}
                </div>
              ))}
        </div>
      </div>

      {visibleAssets.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
            {t('page.balances.detail.assets')}
          </h3>
          {visibleAssets.map(section => (
            <Section key={section.title} title={section.title} sign={section.sign} rows={section.rows} />
          ))}
        </div>
      )}

      {visibleLiabilities.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-destructive">
            {t('page.balances.detail.liabilities')}
          </h3>
          {visibleLiabilities.map(section => (
            <Section key={section.title} title={section.title} sign={section.sign} rows={section.rows} />
          ))}
        </div>
      )}

      {balance.comment
        ? (
            <div className="space-y-1">
              <h4 className="text-sm font-medium">{t('page.balances.table.comment')}</h4>
              <p className="text-sm text-muted-foreground">{balance.comment}</p>
            </div>
          )
        : null}
    </div>
  )
}
