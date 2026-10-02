import type { StockLotDTO } from '@remnant/shared'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuditLogQuery, useCurrencyQuery, useStockLotQuery, useStockMoveQuery } from '@/api/hooks'
import { AuditChangesList } from '@/components'
import {
  Badge,
  Button,
  Checkbox,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Skeleton,
} from '@/components/ui'
import { formatDate, fromMinor } from '@/utils/helpers'
import { useLocale } from '@/utils/hooks'
import { useProductContext } from '../context'

export function LogsSheet() {
  const { t } = useLocale()
  const { isLogsModalOpen, closeLogsModal, selectedProductLogs, listQueryState } = useProductContext()

  const title = selectedProductLogs?.type === 'audit'
    ? t('page.products.audit.logs.title')
    : selectedProductLogs?.type === 'lots'
      ? t('page.products.lots.title')
      : t('page.products.quantity.logs.title')
  const description = selectedProductLogs?.type === 'audit'
    ? t('page.products.audit.logs.description')
    : selectedProductLogs?.type === 'lots'
      ? t('page.products.lots.description')
      : t('page.products.quantity.logs.description')

  const content = () => {
    switch (selectedProductLogs?.type) {
      case 'audit':
        return <AuditLogsBlock selectedProductLogs={selectedProductLogs as { type: 'audit', id: string }} />
      case 'quantity':
        return <QuantityLogsBlock selectedProductLogs={selectedProductLogs as { type: 'quantity', id: string }} selectedWarehouse={listQueryState.filters.selectedWarehouse} />
      case 'lots':
        return <StockLotsBlock selectedProductLogs={selectedProductLogs as { type: 'lots', id: string }} selectedWarehouse={listQueryState.filters.selectedWarehouse} />
      case undefined:
        return (
          <div className="flex flex-col gap-2 h-full overflow-auto">
            {Array.from({ length: 10 }).map((_, index) => <Skeleton className="h-10 w-full" key={index} />)}
          </div>
        )
    }
  }

  return (
    <div>
      <Sheet open={isLogsModalOpen} onOpenChange={() => closeLogsModal()}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription>{description}</SheetDescription>
          </SheetHeader>
          <div className="w-full pb-4 px-4 flex flex-col gap-2 h-full overflow-auto">
            {content()}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

function AuditLogsBlock({ selectedProductLogs }: { selectedProductLogs: { type: 'audit', id: string } }) {
  const { t } = useLocale()

  const { auditLogs, isLoading, isFetching } = useAuditLogQuery(
    { pagination: { full: true }, filters: { resourceType: ['product'], resourceId: [selectedProductLogs.id] } },
  )

  if (isLoading || isFetching) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 10 }).map((_, index) => <Skeleton className="h-10 w-full" key={index} />)}
      </div>
    )
  }

  if (auditLogs.length === 0)
    return <div className="text-muted-foreground text-center my-6">{t('page.products.audit.logs.noLogs')}</div>

  return (
    <div className="space-y-2">
      {auditLogs.map(auditLog => (
        <div className="rounded-lg border border-border bg-card p-4" key={auditLog.id}>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge variant="outline">
              {t(`page.audit-logs.table.action.${auditLog.action}`)}
            </Badge>
            {auditLog.createdBy?.name && (
              <Badge variant="secondary" className="text-xs">
                {auditLog.createdBy.name}
              </Badge>
            )}
            <span className="ml-auto font-mono text-xs text-muted-foreground">
              {formatDate(auditLog.createdAt, 'dd.MM.yyyy HH:mm')}
            </span>
          </div>
          <AuditChangesList changes={auditLog.changes} />
        </div>
      ))}
    </div>
  )
}

function QuantityLogsBlock({ selectedProductLogs, selectedWarehouse }: { selectedProductLogs: { type: 'quantity', id: string }, selectedWarehouse: string }) {
  const { t, language } = useLocale()

  const { stockMoves, isLoading, isFetching } = useStockMoveQuery(
    { pagination: { full: true }, filters: { productId: selectedProductLogs.id, warehouseId: selectedWarehouse } },
  )

  if (isLoading || isFetching) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 10 }).map((_, index) => <Skeleton className="h-10 w-full" key={index} />)}
      </div>
    )
  }

  if (stockMoves.length === 0)
    return <div className="text-muted-foreground text-center my-6">{t('page.products.quantity.logs.noLogs')}</div>

  return (
    <div className="space-y-2">
      {stockMoves.map((move) => {
        const getViewPath = () => {
          if (!move.documentSeq)
            return ''
          if (move.documentType === 'order')
            return `/orders/view/${move.documentSeq}`
          if (move.documentType === 'inventory')
            return `/inventories/view/${move.documentSeq}`
          if (move.documentType === 'warehouse-transaction')
            return `/warehouse-transactions`
          if (move.documentType === 'procurement')
            return `/procurements`
          return ''
        }

        const isOut = move.fromWarehouseId === selectedWarehouse
        const delta = isOut ? -move.quantity : move.quantity
        const isPositive = delta > 0
        const viewPath = getViewPath()
        const canView = Boolean(viewPath)
        const warehouseName = (isOut ? move.fromWarehouse : move.toWarehouse)?.names[language]

        const badgeClass = move.documentType === 'inventory'
          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
          : isPositive
            ? 'bg-green-500/15 text-green-500'
            : 'bg-destructive/15 text-destructive'

        return (
          <div className="group relative rounded-lg border border-border bg-card transition-all hover:border-accent hover:bg-accent/5" key={move.id}>
            <div className="flex items-center gap-4 p-4">
              <div
                className={`flex h-12 min-w-12 shrink-0 items-center justify-center rounded-md px-2 font-mono text-sm font-semibold transition-colors ${badgeClass}`}
              >
                <div className="flex items-center gap-0.5">
                  {isPositive ? '+' : '−'}
                  <span>{Math.abs(delta)}</span>
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-medium text-foreground">
                      {`${t(`page.products.quantity.logs.type.${move.documentType}`)} ${move.documentSeq || ''}`}
                    </h3>
                    <div className="flex items-center gap-2">
                      {move.user?.name && (
                        <Badge variant="secondary" className="text-xs">
                          {move.user.name}
                        </Badge>
                      )}
                      {warehouseName && (
                        <Badge variant="outline" className="text-xs">
                          {warehouseName}
                        </Badge>
                      )}
                      {move.cancelled && (
                        <Badge variant="destructive" className="text-xs">
                          {t('page.products.quantity.logs.cancelled')}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-mono">{formatDate(move.createdAt, 'dd.MM.yyyy HH:mm')}</span>
                    <span>
                      {move.fromKind}
                      {' → '}
                      {move.toKind}
                    </span>
                  </div>
                  {canView && (
                    <Button size="sm" variant="ghost" asChild>
                      <Link to={viewPath}>
                        {t('page.products.quantity.logs.view')}
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function StockLotsBlock({ selectedProductLogs, selectedWarehouse }: { selectedProductLogs: { type: 'lots', id: string }, selectedWarehouse: string }) {
  const { t, language } = useLocale()
  const pageSize = 50
  const [page, setPage] = useState(1)
  const [showDepleted, setShowDepleted] = useState(false)
  const [lots, setLots] = useState<StockLotDTO[]>([])
  const { currencies = [] } = useCurrencyQuery({ pagination: { full: true } })
  const { stockLots, stockLotsCount, isLoading, isFetching } = useStockLotQuery(
    {
      filters: {
        productId: selectedProductLogs.id,
        warehouseId: selectedWarehouse,
        ...(showDepleted ? {} : { open: true }),
      },
      sorters: { receivedAt: 'desc' },
      pagination: { current: page, pageSize },
    },
  )

  useEffect(() => {
    setPage(1)
    setLots([])
  }, [selectedProductLogs.id, selectedWarehouse, showDepleted])

  useEffect(() => {
    if (isFetching)
      return
    setLots(prev => page === 1 ? stockLots : [...prev, ...stockLots])
  }, [stockLots, page, isFetching])

  const hasMore = lots.length < stockLotsCount
  const showInitialLoading = isLoading && page === 1 && lots.length === 0

  if (showInitialLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 8 }).map((_, index) => <Skeleton className="h-9 w-full" key={index} />)}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <Checkbox
          checked={showDepleted}
          onCheckedChange={value => setShowDepleted(value === true)}
        />
        {t('page.products.lots.show-depleted')}
      </label>

      {lots.length === 0
        ? <div className="text-muted-foreground text-center my-6">{t('page.products.lots.noLots')}</div>
        : (
            <div className="space-y-1.5">
              {lots.map((lot) => {
                const currency = currencies.find(item => item.id === lot.currencyId)
                const cost = fromMinor(Number(lot.minorUnitCost) || 0, currency?.scale ?? 2)
                const symbol = currency?.symbols?.[language] || currency?.symbols?.en || ''

                return (
                  <div
                    className="flex items-center justify-between gap-3 rounded-md border border-border bg-card px-3 py-2"
                    key={lot.id}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="font-mono text-sm font-semibold tabular-nums shrink-0">
                        {lot.remainingCount}
                        {' / '}
                        {lot.originalCount}
                      </span>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {t('page.products.lots.remaining')}
                      </Badge>
                      <span className="text-xs text-muted-foreground truncate">
                        {formatDate(lot.receivedAt, 'dd.MM.yyyy HH:mm')}
                      </span>
                    </div>
                    <div className="text-sm font-medium tabular-nums shrink-0">
                      {cost}
                      {' '}
                      {symbol}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

      {hasMore && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          loading={isFetching && page > 1}
          disabled={isFetching}
          onClick={() => setPage(prev => prev + 1)}
        >
          {t('page.products.lots.load-more')}
        </Button>
      )}
    </div>
  )
}
