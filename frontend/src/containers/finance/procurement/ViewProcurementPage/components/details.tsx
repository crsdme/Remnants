import type { ViewProcurementProductRow } from '../context'
import { useQueryClient } from '@tanstack/react-query'
import { createColumnHelper } from '@tanstack/react-table'
import { Ban, ClipboardList, CreditCard, FileText, Package, Pencil, ShoppingCart, Truck, Wallet } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  usePaymentApplicationQuery,
  useProcurementPay,
  useProcurementPayCancel,
  useProcurementUnconfirm,
  useProductPropertyQuery,
  useSupplierQuery,
  useWarehouseTransactionQuery,
} from '@/api/hooks'
import { useProcurementConfirm } from '@/api/hooks/procurement/useProcurementConfirm'
import { PermissionGate, ProductSelectedTableNew } from '@/components'
import {
  formatQuantitiesByUnit,
  makeBarcodesColumn,
  makeCategoriesColumn,
  makeImagesColumn,
  makeNameColumn,
  makeProductPropertyColumns,
  makePurchasePriceColumn,
  makeReadOnlyQuantityColumn,
  makeSeqColumn,
  makeUnitColumn,
} from '@/components/ProductSelectedTableNew/columns'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Badge,
  Button,
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
import { ProcurementPaySheet } from '../../components/ProcurementPaySheet'
import { useViewProcurementContext } from '../context'

function formatAmount(value: number) {
  const rounded = Math.round(value * 100) / 100
  return Number(rounded).toString()
}

export function ViewProcurementDetails() {
  const { t, language } = useLocale()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { procurement, items, isLoading } = useViewProcurementContext()
  const [payOpen, setPayOpen] = useState(false)
  const [cancelPaymentId, setCancelPaymentId] = useState<string | null>(null)

  const { warehouseTransactions: [inbound] } = useWarehouseTransactionQuery(
    {
      filters: {
        sourceModel: 'procurement',
        sourceId: procurement?.id,
      },
      pagination: { current: 1, pageSize: 1 },
    },
    { options: { enabled: Boolean(procurement?.id) && procurement?.status !== 'draft' } },
  )

  const { paymentApplications } = usePaymentApplicationQuery(
    {
      filters: {
        documentType: 'procurement',
        documentId: procurement?.id,
      },
      pagination: { full: true },
    },
    { options: { enabled: Boolean(procurement?.id) } },
  )

  const { suppliers: [paySupplier] } = useSupplierQuery(
    {
      filters: { ids: procurement?.supplierId ? [procurement.supplierId] : [] },
      pagination: { current: 1, pageSize: 1 },
    },
    { options: { enabled: Boolean(procurement?.supplierId) } },
  )

  const invalidateFinance = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['procurements'] }),
      queryClient.invalidateQueries({ queryKey: ['payment-applications'] }),
      queryClient.invalidateQueries({ queryKey: ['money-transactions'] }),
      queryClient.invalidateQueries({ queryKey: ['warehouse-transactions'] }),
      queryClient.invalidateQueries({ queryKey: ['suppliers'] }),
    ])
  }

  const { mutate: confirmProcurement, isPending: isConfirming } = useProcurementConfirm({
    options: {
      onSuccess: ({ data }) => {
        void invalidateFinance()
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data?.message ?? ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const { mutate: unconfirmProcurement, isPending: isUnconfirming } = useProcurementUnconfirm({
    options: {
      onSuccess: ({ data }) => {
        void invalidateFinance()
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data?.message ?? ''}` })
        void navigate(`/procurements/edit/${data.data.seq}`)
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const { mutate: payProcurement, isPending: isPaying } = useProcurementPay({
    options: {
      onSuccess: ({ data }) => {
        void invalidateFinance()
        setPayOpen(false)
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data?.message ?? ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const { mutate: cancelPayment, isPending: isCancelling } = useProcurementPayCancel({
    options: {
      onSuccess: ({ data }) => {
        void invalidateFinance()
        setCancelPaymentId(null)
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data?.message ?? ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const defaultDebt = useMemo(() => {
    return (procurement?.balanceByCurrency ?? []).find(row => row.amount > 0)
      ?? procurement?.balanceByCurrency?.[0]
  }, [procurement])

  const creditForDebt = useMemo(() => {
    if (!defaultDebt)
      return 0
    const credit = (paySupplier?.balances ?? []).find(item => item.currency.id === defaultDebt.currency.id)
    return Math.abs(credit?.amount ?? 0)
  }, [defaultDebt, paySupplier])

  const { productProperties } = useProductPropertyQuery({
    filters: { active: [true], language, showInTable: true },
    pagination: { full: true },
  })

  const productColumns = useMemo(() => {
    const columnHelper = createColumnHelper<ViewProcurementProductRow>()
    return [
      makeImagesColumn(columnHelper, { t }),
      makeSeqColumn(columnHelper, { t, defaultVisible: true }),
      makeNameColumn(columnHelper, { t, language }),
      makeBarcodesColumn(columnHelper, { t, defaultVisible: true }),
      makeCategoriesColumn(columnHelper, { t, language, defaultVisible: true }),
      makeUnitColumn(columnHelper, { t, language, defaultVisible: true }),
      ...makeProductPropertyColumns(columnHelper, { t, language, productProperties }),
      makePurchasePriceColumn(columnHelper, {
        t,
        language,
        field: 'purchasePrice',
        currencyField: 'purchaseCurrencyId',
      }),
      makeReadOnlyQuantityColumn(columnHelper, {
        language,
        field: 'quantity',
        title: t('component.productTable.table.orderedQuantity'),
      }),
      makeReadOnlyQuantityColumn(columnHelper, {
        language,
        field: 'receivedQuantity',
        title: t('component.productTable.table.alreadyReceived'),
        showMatch: true,
        matchField: 'quantity',
      }),
    ]
  }, [language, productProperties, t])

  if (isLoading) {
    return <Skeleton className="mt-4 w-full h-64 rounded-md" />
  }

  if (!procurement) {
    return <p className="mt-6 text-sm text-muted-foreground">{t('table.noResults')}</p>
  }

  const totalEntries = (procurement.itemsByCurrency ?? []).map(item => ([
    item.currency.symbols[language] || item.currency.id,
    item.amount,
  ] as const))
  const debtEntries = (procurement.balanceByCurrency ?? []).map(item => ([
    item.currency.symbols[language] || item.currency.id,
    item.amount,
  ] as const))
  const inboundHref = inbound
    ? (inbound.status === 'awaiting' || inbound.accepted !== true
        ? `/warehouse-transactions/receive/${inbound.seq}`
        : `/warehouse-transactions/view/${inbound.seq}`)
    : null
  const canPay = procurement.status !== 'cancelled'
  const canPayFromCredit = canPay && creditForDebt > 0 && (defaultDebt?.amount ?? 0) > 0
  const cashDefaultAmount = Math.max(0, (defaultDebt?.amount ?? 0) - creditForDebt)

  return (
    <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px] lg:items-start">
      <div className="min-w-0 space-y-4">
        <div className="space-y-3 rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2">
            <Package className="size-5 shrink-0" />
            <p className="text-lg font-bold">{t('page.procurements.form.products')}</p>
            <Separator className="flex-1" />
          </div>

          {items.length === 0
            ? (
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 py-10 text-center">
                  <ShoppingCart className="size-8 text-muted-foreground/50" />
                  <p className="text-sm font-medium text-muted-foreground">
                    {t('page.procurements.form.products-empty')}
                  </p>
                </div>
              )
            : (
                <ProductSelectedTableNew<ViewProcurementProductRow>
                  products={items}
                  columns={productColumns}
                  isLoading={isLoading}
                  disabled
                  showHeader={false}
                  tableId="procurement-view-products"
                />
              )}
        </div>

        <div className="space-y-3 rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="size-5 shrink-0" />
            <p className="text-lg font-bold">{t('page.procurements.form.information')}</p>
            <Separator className="flex-1" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-muted-foreground">{t('page.procurements.pay.label.seq')}</p>
              <p className="text-sm text-foreground">{procurement.seq}</p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-muted-foreground">{t('page.procurements.pay.label.supplier')}</p>
              {procurement.supplierId
                ? (
                    <Link className="text-sm text-primary hover:underline" to={`/suppliers/view/${procurement.supplier?.seq || procurement.supplierId}`}>
                      {procurement.supplier?.name ?? '—'}
                    </Link>
                  )
                : <p className="text-sm text-foreground">{procurement.supplier?.name ?? '—'}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-muted-foreground">{t('page.procurements.table.warehouse')}</p>
              <p className="text-sm text-foreground">{procurement.warehouse?.names[language] ?? '—'}</p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-muted-foreground">{t('page.procurements.pay.label.status')}</p>
              <Badge variant="outline">{t(`page.procurements.status.${(procurement.status || '').toLowerCase()}`)}</Badge>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-muted-foreground">{t('page.procurements.table.paymentStatus')}</p>
              <Badge variant="outline">{t(`page.procurements.paymentStatus.${procurement.paymentStatus ?? 'unpaid'}`)}</Badge>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-muted-foreground">{t('page.procurements.view.inbound')}</p>
              {inboundHref
                ? (
                    <Link className="inline-flex items-center gap-1 text-sm text-primary hover:underline" to={inboundHref}>
                      <Truck className="size-3.5" />
                      {t('page.procurements.view.inbound-seq', { seq: inbound.seq })}
                    </Link>
                  )
                : <p className="text-sm text-foreground">—</p>}
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-muted-foreground">{t('page.procurements.pay.label.comment')}</p>
              <p className="text-sm text-foreground">{procurement.comment || '—'}</p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-muted-foreground">{t('page.procurements.pay.label.createdAt')}</p>
              <p className="text-sm text-foreground">{formatDate(procurement.createdAt)}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3 rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2">
            <CreditCard className="size-5 shrink-0" />
            <p className="text-lg font-bold">{t('page.procurements.view.payments')}</p>
            <Separator className="flex-1" />
          </div>
          {paymentApplications.length === 0
            ? (
                <p className="text-sm text-muted-foreground">{t('page.procurements.view.payments-empty')}</p>
              )
            : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('page.money-transactions.form.amount')}</TableHead>
                      <TableHead>{t('page.procurements.pay.label.status')}</TableHead>
                      <TableHead>{t('table.createdAt')}</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentApplications.map(payment => (
                      <TableRow key={payment.id}>
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
                        <TableCell className="text-right">
                          {!payment.cancelled && canPay && (
                            <PermissionGate permission="procurement.pay">
                              <Button variant="outline" size="sm" onClick={() => setCancelPaymentId(payment.id)}>
                                <Ban className="size-4" />
                                {t('table.cancel-payment')}
                              </Button>
                            </PermissionGate>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
        </div>
      </div>

      <aside className="flex flex-col gap-4 lg:sticky lg:top-4">
        <div className="space-y-3 rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2">
            <FileText className="size-5 shrink-0" />
            <p className="text-lg font-bold">{t('page.procurements.form.procurement-total')}</p>
            <Separator className="flex-1" />
          </div>
          <div className="flex items-start justify-between gap-3 text-sm">
            <span className="text-muted-foreground">{t('page.procurements.form.ordered')}</span>
            <span className="tabular-nums text-right">{formatQuantitiesByUnit(items as unknown as Array<Record<string, unknown>>, 'quantity', language)}</span>
          </div>
          <div className="flex items-start justify-between gap-3 text-sm">
            <span className="text-muted-foreground">{t('page.procurements.form.received')}</span>
            <span className="tabular-nums text-right">{formatQuantitiesByUnit(items as unknown as Array<Record<string, unknown>>, 'receivedQuantity', language)}</span>
          </div>
          <div className="flex items-start justify-between gap-3 border-t pt-3">
            <span className="font-semibold">{t('page.procurements.form.total')}</span>
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
          <div className="flex items-start justify-between gap-3">
            <span className="font-semibold">{t('page.procurements.pay.label.debt')}</span>
            <div className="flex flex-col items-end gap-0.5 text-base font-semibold tabular-nums">
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
        </div>
        {canPayFromCredit && (
          <PermissionGate permission="procurement.pay">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              loading={isPaying}
              disabled={isPaying}
              onClick={() => payProcurement({
                procurementId: procurement.id,
                currency: defaultDebt?.currency.id ?? '',
              })}
            >
              <Wallet className="size-4" />
              {t('page.procurements.pay.from-credit')}
            </Button>
          </PermissionGate>
        )}
        {canPay && (
          <PermissionGate permission="procurement.pay">
            <Button type="button" className="w-full" onClick={() => setPayOpen(true)}>
              <CreditCard className="size-4" />
              {t('table.pay')}
            </Button>
          </PermissionGate>
        )}
        {procurement.status === 'draft' && (
          <>
            <PermissionGate permission="procurement.edit">
              <Button type="button" variant="outline" className="w-full" onClick={() => void navigate(`/procurements/edit/${procurement.seq}`)}>
                <Pencil className="size-4" />
                {t('table.edit')}
              </Button>
            </PermissionGate>
            <PermissionGate permission="procurement.edit">
              <Button
                type="button"
                className="w-full"
                loading={isConfirming}
                disabled={isConfirming}
                onClick={() => confirmProcurement({
                  id: procurement.id,
                  ...(procurement.warehouseId ? { warehouseId: procurement.warehouseId } : {}),
                })}
              >
                {t('table.confirm')}
              </Button>
            </PermissionGate>
          </>
        )}
        {procurement.status === 'ordered' && (
          <PermissionGate permission="procurement.edit">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              loading={isUnconfirming}
              disabled={isUnconfirming}
              onClick={() => unconfirmProcurement({ id: procurement.id })}
            >
              {t('table.unconfirm')}
            </Button>
          </PermissionGate>
        )}
        {inboundHref && (
          <Button type="button" variant="secondary" className="w-full" onClick={() => void navigate(inboundHref)}>
            <Truck className="size-4" />
            {t('page.procurements.view.open-inbound')}
          </Button>
        )}
        <Button type="button" variant="secondary" className="w-full" onClick={() => void navigate('/procurements')}>
          {t('button.back')}
        </Button>
      </aside>

      <ProcurementPaySheet
        open={payOpen}
        onOpenChange={setPayOpen}
        title={t('page.procurements.pay.title')}
        description={t('page.procurements.pay.description')}
        defaultAmount={cashDefaultAmount}
        defaultCurrencyId={defaultDebt?.currency.id ?? ''}
        availableCredit={creditForDebt}
        availableCreditSymbol={defaultDebt?.currency.symbols[language] || ''}
        isLoading={isPaying}
        onSubmit={values => payProcurement({
          procurementId: procurement.id,
          cashregister: values.cashregister,
          account: values.account,
          currency: values.currency,
          amount: values.amount,
          comment: values.comment,
        })}
      />

      <AlertDialog open={cancelPaymentId !== null} onOpenChange={open => !open && setCancelPaymentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('page.procurements.view.cancel-payment-title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('page.procurements.view.cancel-payment-description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('button.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              disabled={isCancelling}
              onClick={() => {
                if (cancelPaymentId)
                  cancelPayment({ applicationId: cancelPaymentId })
              }}
            >
              {t('table.cancel-payment')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
