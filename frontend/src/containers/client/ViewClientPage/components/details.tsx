import type { SupplierBalanceDTO } from '@remnant/shared'
import type { SupportedLanguage } from '@/utils/constants'
import { useQueryClient } from '@tanstack/react-query'
import { ClipboardList, CreditCard, FileText, ShoppingCart } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useClientPay, useMoneyTransactionQuery } from '@/api/hooks'
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
import { ProcurementPaySheet } from '../../../finance/procurement/components/ProcurementPaySheet'
import { useViewClientContext } from '../context'

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

export function ViewClientDetails() {
  const { t, language } = useLocale()
  const queryClient = useQueryClient()
  const { client, orders, isLoading, payOpen, setPayOpen } = useViewClientContext()

  const debts = useMemo(() => rowsOf(client?.debts, language), [language, client?.debts])
  const payments = useMemo(() => rowsOf(client?.payments, language), [language, client?.payments])
  const balances = useMemo(() => rowsOf(client?.balances, language), [language, client?.balances])
  const defaultDebt = debts.find(row => row.amount > 0)

  const { moneyTransactions, isLoading: isPaymentsLoading } = useMoneyTransactionQuery(
    {
      filters: { sourceModel: 'client', sourceId: client?.id },
      sorters: { createdAt: 'desc' },
      pagination: { full: true },
    },
    { options: { enabled: Boolean(client?.id) } },
  )

  const { mutate: payClient, isPending: isPaying } = useClientPay({
    options: {
      onSuccess: ({ data }) => {
        void queryClient.invalidateQueries({ queryKey: ['orders'] })
        void queryClient.invalidateQueries({ queryKey: ['payment-applications'] })
        void queryClient.invalidateQueries({ queryKey: ['money-transactions'] })
        void queryClient.invalidateQueries({ queryKey: ['clients'] })
        setPayOpen(false)
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data?.message ?? ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  if (isLoading)
    return <Skeleton className="mt-4 w-full h-64 rounded-md" />

  if (!client)
    return <p className="mt-6 text-sm text-muted-foreground">{t('table.noResults')}</p>

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
          <p className="text-lg font-bold">{t('page.clients.view.information')}</p>
          <Separator className="flex-1" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-muted-foreground">{t('table.seq')}</p>
            <p className="text-sm text-foreground">{client.seq || '—'}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-muted-foreground">{t('page.clients.table.name')}</p>
            <p className="text-sm text-foreground">{`${client.name} ${client.middleName || ''} ${client.lastName || ''}`.trim()}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-muted-foreground">{t('page.clients.table.phones')}</p>
            <p className="text-sm text-foreground">{client.phones?.join(', ') || '—'}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-muted-foreground">{t('page.clients.table.emails')}</p>
            <p className="text-sm text-foreground">{client.emails?.join(', ') || '—'}</p>
          </div>
          <div className="flex flex-col gap-1 sm:col-span-2">
            <p className="text-sm font-medium text-muted-foreground">{t('page.clients.form.comment')}</p>
            <p className="text-sm text-foreground">{client.comment || '—'}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="size-5 shrink-0" />
          <p className="text-lg font-bold">{t('page.clients.view.settlement')}</p>
          <Separator className="flex-1" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="@container/card">
            <CardHeader>
              <CardDescription>{t('page.clients.table.debt')}</CardDescription>
              <CardTitle className="flex flex-col gap-1 text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {settlementRows.some(row => row.debt !== 0)
                  ? settlementRows.filter(row => row.debt !== 0).map(row => <span key={row.currencyId}>{moneyLabel({ amount: row.debt, symbol: row.symbol })}</span>)
                  : '0'}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="@container/card">
            <CardHeader>
              <CardDescription>{t('page.clients.table.paid')}</CardDescription>
              <CardTitle className="flex flex-col gap-1 text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {settlementRows.some(row => row.paid !== 0)
                  ? settlementRows.filter(row => row.paid !== 0).map(row => <span key={row.currencyId}>{moneyLabel({ amount: row.paid, symbol: row.symbol })}</span>)
                  : '0'}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="@container/card">
            <CardHeader>
              <CardDescription>{t('page.clients.table.credit')}</CardDescription>
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
          <p className="text-lg font-bold">{t('page.clients.view.orders')}</p>
          <Separator className="flex-1" />
        </div>
        {orders.length === 0
          ? <p className="text-sm text-muted-foreground">{t('page.clients.view.orders-empty')}</p>
          : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('table.seq')}</TableHead>
                    <TableHead>{t('page.orders.table.orderPaymentStatus')}</TableHead>
                    <TableHead>{t('page.orders.table.totals')}</TableHead>
                    <TableHead>{t('table.createdAt')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Link className="text-primary hover:underline" to={`/orders/view/${item.seq}`}>
                          {item.seq}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{t(`order-payment.${item.orderPaymentStatus}`)}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {(item.totals ?? []).map(row => (
                            <span key={row.currency}>{formatAmount(row.total)}</span>
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
          <p className="text-lg font-bold">{t('page.clients.view.payments')}</p>
          <Separator className="flex-1" />
        </div>
        {isPaymentsLoading
          ? <Skeleton className="h-24 w-full rounded-md" />
          : moneyTransactions.length === 0
            ? <p className="text-sm text-muted-foreground">{t('page.clients.view.payments-empty')}</p>
            : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('table.seq')}</TableHead>
                      <TableHead>{t('page.money-transactions.form.amount')}</TableHead>
                      <TableHead>{t('page.procurements.pay.label.status')}</TableHead>
                      <TableHead>{t('table.createdAt')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {moneyTransactions.map(payment => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.seq}</TableCell>
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
                    ))}
                  </TableBody>
                </Table>
              )}
      </div>

      <ProcurementPaySheet
        open={payOpen}
        onOpenChange={setPayOpen}
        title={t('page.clients.view.pay')}
        description={t('page.clients.view.pay-description')}
        defaultAmount={defaultDebt?.amount ?? 0}
        defaultCurrencyId={payCurrencyId}
        availableCredit={availableCredit}
        availableCreditSymbol={creditSymbol}
        isLoading={isPaying}
        onSubmit={values => payClient({
          clientId: client.id,
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
