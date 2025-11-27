import { useTranslation } from 'react-i18next'
import { useAuditLogQuery, useWarehouseTransactionLogQuery } from '@/api/hooks'
import {
  Badge,
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
import { useProductContext } from '../context'

export function LogsSheet() {
  const { t } = useTranslation()
  const { isLogsModalOpen, closeLogsModal, selectedProductLogs, selectedWarehouse } = useProductContext()
  const title = selectedProductLogs?.type === 'audit' ? t('page.products.audit.logs.title') : t('page.products.quantity.logs.title')
  const description = selectedProductLogs?.type === 'audit' ? t('page.products.audit.logs.description') : t('page.products.quantity.logs.description')

  const content = () => {
    switch (selectedProductLogs?.type) {
      case 'audit':
        return <AuditLogsBlock selectedProductLogs={selectedProductLogs} />
      case 'quantity':
        return <QuantityLogsBlock selectedProductLogs={selectedProductLogs} selectedWarehouse={selectedWarehouse} />
      default:
        return (
          <div className="flex flex-col gap-2">
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
          <div className="w-full pb-4 px-4">
            {content()}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

function AuditLogsBlock({ selectedProductLogs }) {
  const { t } = useTranslation()

  const { data: { auditLogs = [] } = {}, isLoading, isFetching } = useAuditLogQuery(
    { pagination: { full: true }, filters: { resourceType: ['product'], resourceId: [selectedProductLogs.id] } },
    { options: {
      select: response => ({
        auditLogs: response.data.auditLogs,
        auditLogsCount: response.data.auditLogsCount,
      }),
      placeholderData: prevData => prevData,
    } },
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
              <span className="text-sm text-muted-foreground">{auditLog?.user?.name}</span>
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

function QuantityLogsBlock({ selectedProductLogs, selectedWarehouse }) {
  const { t, i18n } = useTranslation()

  const { data: { warehouseTransactionLogs = [] } = {}, isLoading, isFetching } = useWarehouseTransactionLogQuery(
    { pagination: { current: 1, pageSize: 100 }, filters: { productId: selectedProductLogs.id, warehouseId: selectedWarehouse } },
    { options: {
      select: response => ({
        warehouseTransactionLogs: response.data.warehouseTransactionLogs,
      }),
      placeholderData: prevData => prevData,
    } },
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
    <div>
      {warehouseTransactionLogs.map(wtLog => (
        <Card className="mb-2" key={wtLog.id}>
          <CardHeader>
            <CardTitle className="text-base flex flex-wrap items-center gap-2">
              <Badge variant="outline">{t(`page.products.quantity.logs.type.${wtLog.refType}`)}</Badge>
              <Badge variant="outline">{wtLog?.user?.name}</Badge>
              <Badge variant="outline">{wtLog?.warehouse?.names[i18n.language]}</Badge>
              <span className="text-xs text-muted-foreground ml-auto">{formatDate(wtLog.createdAt, 'dd.MM.yyyy HH:mm')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {
                wtLog.deltaCount > 0
                  ? (
                      <Badge variant="success">
                        {`+${wtLog.deltaCount}`}
                      </Badge>
                    )
                  : (
                      <Badge variant="destructive">
                        {`${wtLog.deltaCount}`}
                      </Badge>
                    )
              }
            </div>
          </CardContent>
        </Card>
      ))}
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

function ChangeRow({ change }) {
  const beforeStr = formatValue(change.before)
  const afterStr = formatValue(change.after)
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
