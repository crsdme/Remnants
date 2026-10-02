import type { SupplierBalanceDTO } from '@remnant/shared'
import type { SupportedLanguage } from '@/utils/constants'
import { useQueryClient } from '@tanstack/react-query'
import { ClipboardList, CreditCard, FileText, ShoppingCart } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useMoneyTransactionQuery, useSupplierPay } from '@/api/hooks'
import {
  Badge,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui'
import { formatDate } from '@/utils/helpers'
import { useLocale } from '@/utils/hooks'
import { ProcurementPaySheet } from '../../../procurement/components/ProcurementPaySheet'
import { useViewSupplierContext } from '../context'

function formatAmount(value: number) {
  const rounded = Math.round(Math.abs(value) * 100) / 100
  return Number(rounded).toString()
}

function moneyLabel(row: { amount: number, symbol: string }) {
  return `${formatAmount(row.amount)} ${row.symbol}`.trim()
}

function rowsOf(items: SupplierBalanceDTO[] | undefined, language: SupportedLanguage) {
  return (items ?? []).map(row => ({
    currencyId: row.currency.id,
    amount: row.amount,
    symbol: row.currency.symbols[language] || row.currency.symbols.ru || row.currency.symbols.en || '',
  }))
}

export function ViewSupplierDetails() {
  const { t, language } = useLocale()
  const queryClient = useQueryClient()
  const { supplier, procurements, isLoading, payOpen, setPayOpen } = useViewSupplierContext()

  const debts = useMemo(() => rowsOf(supplier?.debts, language), [language, supplier?.debts])
  const payments = useMemo(() => rowsOf(supplier?.payments, language), [language, supplier?.payments])
  const balances = useMemo(() => rowsOf(supplier?.balances, language), [language, supplier?.balances])
  const defaultDebt = debts.find(row => row.amount > 0)

  const { moneyTransactions, isLoading: isPaymentsLoading } = useMoneyTransactionQuery(
    {
      filters: { sourceModel: 'supplier', sourceId: supplier?.id },
      sorters: { createdAt: 'desc' },
      pagination: { full: true },
    },
    { options: { enabled: Boolean(supplier?.id) } },
  )

  const procurementById = useMemo(
    () => new Map(procurements.map(item => [item.id, item])),
    [procurements],
  )

  const { mutate: paySupplier, isPending: isPaying } = useSupplierPay({
    options: {
      onSuccess: ({ data }) => {
        void queryClient.invalidateQueries({ queryKey: ['procurements'] })
        void queryClient.invalidateQueries({ queryKey: ['payment-applications'] })
        void queryClient.invalidateQueries({ queryKey: ['money-transactions'] })
        void queryClient.invalidateQueries({ queryKey: ['suppliers'] })
        setPayOpen(false)
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data?.message ?? ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  if (isLoading) {
    return <Skeleton className="mt-4 w-full h-64 rounded-md" />
  }

  if (!supplier) {
    return <p className="mt-6 text-sm text-muted-foreground">{t('table.noResults')}</p>
  }

  const openProcurements = procurements.filter(item => item.status !== 'cancelled')
  const currencies = [...new Map(
    [...debts, ...payments, ...balances].map(row => [row.currencyId, row]),
  ).values()]
  const settlementRows = currencies.map((currency) => {
    const debt = debts.find(row => row.currencyId === currency.currencyId)?.amount ?? 0
    const paid = payments.find(row => row.currencyId === currency.currencyId)?.amount ?? 0
    const balance = balances.find(row => row.currencyId === currency.currencyId)?.amount ?? 0
    return { currencyId: currency.currencyId, symbol: currency.symbol, debt, paid, balance }
  })
  const payCurrencyId = defaultDebt?.currencyId ?? payments[0]?.currencyId ?? debts[0]?.currencyId ?? ''
  const creditRow = balances.find(row => !payCurrencyId || row.currencyId === payCurrencyId)
  const availableCredit = Math.abs(creditRow?.amount ?? 0)
  const creditSymbol = creditRow?.symbol || ''

  return (
    <div className="mt-4 space-y-4">
      <div className="space-y-3 rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2">
          <ClipboardList className="size-5 shrink-0" />
          <p className="text-lg font-bold">{t('page.suppliers.view.information')}</p>
          <Separator className="flex-1" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-muted-foreground">{t('table.seq')}</p>
            <p className="text-sm text-foreground">{supplier.seq || '—'}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-muted-foreground">{t('page.suppliers.table.name')}</p>
            <p className="text-sm text-foreground">{supplier.name}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-muted-foreground">{t('page.suppliers.table.phones')}</p>
            <p className="text-sm text-foreground">{supplier.phones?.join(', ') || '—'}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-muted-foreground">{t('page.suppliers.table.emails')}</p>
            <p className="text-sm text-foreground">{supplier.emails?.join(', ') || '—'}</p>
          </div>
          <div className="flex flex-col gap-1 sm:col-span-2">
            <p className="text-sm font-medium text-muted-foreground">{t('page.suppliers.form.comment')}</p>
            <p className="text-sm text-foreground">{supplier.comment || '—'}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="size-5 shrink-0" />
          <p className="text-lg font-bold">{t('page.suppliers.view.settlement')}</p>
          <Separator className="flex-1" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="@container/card">
            <CardHeader>
              <CardDescription>{t('page.suppliers.table.debt')}</CardDescription>
              <CardTitle className="flex flex-col gap-1 text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {settlementRows.some(row => row.debt !== 0)
                  ? settlementRows.filter(row => row.debt !== 0).map(row => <span key={row.currencyId}>{moneyLabel({ amount: row.debt, symbol: row.symbol })}</span>)
                  : '0'}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="@container/card">
            <CardHeader>
              <CardDescription>{t('page.suppliers.table.paid')}</CardDescription>
              <CardTitle className="flex flex-col gap-1 text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {settlementRows.some(row => row.paid !== 0)
                  ? settlementRows.filter(row => row.paid !== 0).map(row => <span key={row.currencyId}>{moneyLabel({ amount: row.paid, symbol: row.symbol })}</span>)
                  : '0'}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="@container/card">
            <CardHeader>
              <CardDescription>{t('page.suppliers.table.credit')}</CardDescription>
              <CardTitle className="flex flex-col gap-1 text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {settlementRows.some(row => row.balance !== 0)
                  ? settlementRows.filter(row => row.balance !== 0).map(row => (
                      <span key={row.currencyId} className="text-emerald-600">
                        {moneyLabel({ amount: row.balance, symbol: row.symbol })}
                      </span>
                    ))
                  : '0'}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>

      <div className="space-y-3 rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2">
          <ShoppingCart className="size-5 shrink-0" />
          <p className="text-lg font-bold">{t('page.suppliers.view.procurements')}</p>
          <Separator className="flex-1" />
        </div>
        {openProcurements.length === 0
          ? (
              <p className="text-sm text-muted-foreground">{t('page.suppliers.view.procurements-empty')}</p>
            )
          : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('table.seq')}</TableHead>
                    <TableHead>{t('page.procurements.table.status')}</TableHead>
                    <TableHead>{t('page.procurements.table.paymentStatus')}</TableHead>
                    <TableHead>{t('page.procurements.table.debt')}</TableHead>
                    <TableHead>{t('table.createdAt')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {openProcurements.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Link className="text-primary hover:underline" to={`/procurements/view/${item.seq}`}>
                          {item.seq}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{t(`page.procurements.status.${(item.status || '').toLowerCase()}`)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{t(`page.procurements.paymentStatus.${item.paymentStatus ?? 'unpaid'}`)}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {(item.balanceByCurrency ?? []).map(row => (
                            <span key={row.currency.id}>
                              {formatAmount(row.amount)}
                              {' '}
                              {row.currency.symbols[language] || ''}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(item.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
      </div>

      <div className="space-y-3 rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2">
          <CreditCard className="size-5 shrink-0" />
          <p className="text-lg font-bold">{t('page.suppliers.view.payments')}</p>
          <Separator className="flex-1" />
        </div>
        {isPaymentsLoading
          ? <Skeleton className="h-24 w-full rounded-md" />
          : moneyTransactions.length === 0
            ? (
                <p className="text-sm text-muted-foreground">{t('page.suppliers.view.payments-empty')}</p>
              )
            : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('table.seq')}</TableHead>
                      <TableHead>{t('page.money-transactions.table.sourceModel')}</TableHead>
                      <TableHead>{t('page.money-transactions.form.amount')}</TableHead>
                      <TableHead>{t('page.procurements.pay.label.status')}</TableHead>
                      <TableHead>{t('table.createdAt')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {moneyTransactions.map((payment) => {
                      const procurement = payment.sourceModel === 'procurement'
                        ? procurementById.get(payment.sourceId ?? '')
                        : undefined
                      return (
                        <TableRow key={payment.id}>
                          <TableCell>{payment.seq}</TableCell>
                          <TableCell>
                            {procurement
                              ? (
                                  <Link className="text-primary hover:underline" to={`/procurements/view/${procurement.seq}`}>
                                    {t('page.suppliers.view.payment-procurement', { seq: procurement.seq })}
                                  </Link>
                                )
                              : t('page.suppliers.view.payment-advance')}
                          </TableCell>
                          <TableCell>
                            {formatAmount(payment.amount)}
                            {' '}
                            {payment.currency.symbols[language] || ''}
                          </TableCell>
                          <TableCell>
                            <Badge variant={payment.cancelled ? 'destructive' : 'success'}>
                              {t(payment.cancelled ? 'page.procurements.view.payment-cancelled' : 'page.procurements.view.payment-active')}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(payment.createdAt)}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
      </div>

      <ProcurementPaySheet
        open={payOpen}
        onOpenChange={setPayOpen}
        title={t('page.suppliers.view.pay')}
        description={t('page.suppliers.view.pay-description')}
        defaultAmount={defaultDebt?.amount ?? 0}
        defaultCurrencyId={payCurrencyId}
        availableCredit={availableCredit}
        availableCreditSymbol={creditSymbol}
        isLoading={isPaying}
        onSubmit={values => paySupplier({
          supplierId: supplier.id,
          cashregister: values.cashregister,
          account: values.account,
          currency: values.currency,
          amount: values.amount,
          comment: values.comment,
        })}
      />
    </div>
  )
}
