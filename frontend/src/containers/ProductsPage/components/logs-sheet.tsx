import { Link } from 'react-router-dom'
import { useAuditLogQuery, useWarehouseTransactionLogQuery } from '@/api/hooks'
import { AuditChangesList } from '@/components'
import {
  Badge,
  Button,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Skeleton,
} from '@/components/ui'
import { formatDate } from '@/utils/helpers'
import { useLocale } from '@/utils/hooks'
import { useProductContext } from '../context'

export function LogsSheet() {
  const { t } = useLocale()
  const { isLogsModalOpen, closeLogsModal, selectedProductLogs, listQueryState } = useProductContext()

  const title = selectedProductLogs?.type === 'audit' ? t('page.products.audit.logs.title') : t('page.products.quantity.logs.title')
  const description = selectedProductLogs?.type === 'audit' ? t('page.products.audit.logs.description') : t('page.products.quantity.logs.description')

  const content = () => {
    switch (selectedProductLogs?.type) {
      case 'audit':
        return <AuditLogsBlock selectedProductLogs={selectedProductLogs as { type: 'audit', id: string }} />
      case 'quantity':
        return <QuantityLogsBlock selectedProductLogs={selectedProductLogs as { type: 'quantity', id: string }} selectedWarehouse={listQueryState.filters.selectedWarehouse} />
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

  const { warehouseTransactionLogs, isLoading, isFetching } = useWarehouseTransactionLogQuery(
    { pagination: { full: true }, filters: { productId: selectedProductLogs.id, warehouseId: selectedWarehouse } },
  )

  if (isLoading || isFetching) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 10 }).map((_, index) => <Skeleton className="h-10 w-full" key={index} />)}
      </div>
    )
  }

  if (warehouseTransactionLogs.length === 0)
    return <div className="text-muted-foreground text-center my-6">{t('page.products.quantity.logs.noLogs')}</div>

  return (
    <div className="space-y-2">
      {warehouseTransactionLogs.map((wtLog) => {
        const getViewPath = () => {
          if (wtLog.refType === 'order')
            return `/orders/view/${wtLog?.resource?.seq}`
          if (wtLog.refType === 'inventory')
            return `/inventories/view/${wtLog?.resource?.seq}`
          return ''
        }

        const isInventory = wtLog.refType === 'inventory'
        const isPositive = wtLog.deltaCount > 0
        const hasFromTo = wtLog.previousCount !== undefined && wtLog.afterCount !== undefined
        const viewPath = getViewPath()
        const canView = Boolean(viewPath)

        const badgeClass = isInventory
          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
          : isPositive
            ? 'bg-green-500/15 text-green-500'
            : 'bg-destructive/15 text-destructive'

        return (
          <div className="group relative rounded-lg border border-border bg-card transition-all hover:border-accent hover:bg-accent/5" key={wtLog.id}>
            <div className="flex items-center gap-4 p-4">
              <div
                className={`flex h-12 min-w-12 shrink-0 items-center justify-center rounded-md px-2 font-mono text-sm font-semibold transition-colors ${badgeClass}`}
              >
                {isInventory && hasFromTo
                  ? (
                      <span className="text-center text-xs leading-tight whitespace-nowrap">
                        {t('page.products.quantity.logs.fromTo', {
                          from: wtLog.previousCount,
                          to: wtLog.afterCount,
                        })}
                      </span>
                    )
                  : (
                      <div className="flex items-center gap-0.5">
                        {isPositive ? '+' : '-'}
                        <span>{Math.abs(wtLog.deltaCount)}</span>
                      </div>
                    )}
              </div>

              <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-medium text-foreground">
                      {`${t(`page.products.quantity.logs.type.${wtLog.refType}`)} ${wtLog?.resource?.seq || ''}`}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {wtLog?.user?.name}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {wtLog?.warehouse?.names[language]}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-mono">{formatDate(wtLog.createdAt, 'dd.MM.yyyy HH:mm')}</span>
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
