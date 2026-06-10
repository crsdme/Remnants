import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useAuditLogQuery, useWarehouseTransactionLogQuery } from '@/api/hooks'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Skeleton,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
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
          <div className="flex flex-col gap-2 h-[100%] overflow-auto">
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
          <div className="w-full pb-4 px-4 flex flex-col gap-2 h-[100%] overflow-auto">
            {content()}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

function AuditLogsBlock({ selectedProductLogs }: { selectedProductLogs: { type: 'audit', id: string } }) {
  const { t } = useTranslation()

  // const { data: { auditLogs = [] } = {}, isLoading, isFetching } = useAuditLogQuery(
  //   { pagination: { full: true }, filters: { resourceType: ['product'], resourceId: [selectedProductLogs.id] } },
  //   {
  //     options: {
  //       select: response => ({
  //         auditLogs: response.data.auditLogs,
  //         auditLogsCount: response.data.auditLogsCount,
  //       }),
  //       placeholderData: prevData => prevData,
  //     },
  //   },
  // )

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
    <div>
      {auditLogs.map(auditLog => (
        <Card className="mb-2" key={auditLog.id}>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Badge variant="outline">{t(`page.audit-logs.table.action.${auditLog.action}`)}</Badge>
              <span className="text-sm text-muted-foreground">{auditLog?.createdBy?.name}</span>
              <span className="text-xs text-muted-foreground ml-auto">{formatDate(auditLog.createdAt, 'dd.MM.yyyy HH:mm')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <ChangeRow change={auditLog.changes[0]} />
            </div>
          </CardContent>
        </Card>
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
        const onViewClick = () => {
          if (wtLog.refType === 'warehouse-transaction') {
            return `/warehouse-transactions/view/${wtLog?.resource?.seq}`
          }
          else if (wtLog.refType === 'order') {
            return `/orders/view/${wtLog?.resource?.seq}`
          }
        }

        const isPositive = wtLog.deltaCount > 0

        return (
          <div className="group relative rounded-lg border border-border bg-card transition-all hover:border-accent hover:bg-accent/5" key={wtLog.id}>
            <div className="flex items-center gap-4 p-4">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-md font-mono text-sm font-semibold transition-colors 
                  ${isPositive ? 'bg-green-500/15 text-green-500' : 'bg-destructive/15 text-destructive'}`}
              >
                <div className="flex items-center gap-0.5">
                  {isPositive ? '+' : '-'}
                  <span>{Math.abs(wtLog.deltaCount)}</span>
                </div>
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
                  {['order'].includes(wtLog.refType) && (
                    <Button size="sm" variant="ghost" asChild>
                      <Link to={onViewClick() || ''}>
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

function formatValue(value: unknown): string {
  if (value === null || value === undefined)
    return '—'
  if (typeof value === 'string')
    return value
  if (typeof value === 'number' || typeof value === 'boolean')
    return String(value)
  const json = JSON.stringify(value)
  return json.length > 120 ? `${json.slice(0, 120)}...` : json
}

function ChangeRow({ change }: { change: { path: string, before?: unknown, after?: unknown } }) {
  const beforeStr = formatValue(change.before || '')
  const afterStr = formatValue(change.after || '')
  const fullBefore = JSON.stringify(change.before, null, 2)
  const fullAfter = JSON.stringify(change.after, null, 2)

  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="font-medium text-muted-foreground min-w-[120px]">
        {change.path}
        :
      </span>
      <div className="flex items-center gap-2 flex-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-muted-foreground truncate">{beforeStr}</span>
            </TooltipTrigger>
            <TooltipContent>
              <pre className="text-xs max-w-md overflow-auto truncate">{fullBefore}</pre>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <span className="text-muted-foreground">→</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="truncate">{afterStr}</span>
            </TooltipTrigger>
            <TooltipContent>
              <pre className="text-xs max-w-md overflow-auto">{fullAfter}</pre>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}
