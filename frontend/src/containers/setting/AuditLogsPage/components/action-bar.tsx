import type { AuditLogPopulatedDTO } from '@remnant/shared'
import { useTranslation } from 'react-i18next'
import { PermissionGate } from '@/components'
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui'
import { useAuditLogsContext } from '../context'

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

function AuditLogChanges({ selectedAuditLog, change }: { selectedAuditLog: AuditLogPopulatedDTO, change: { path: string, before?: unknown, after?: unknown } }) {
  const { t } = useTranslation()
  return (
    <Card className="mb-2">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Badge variant="outline">{t(`page.audit-logs.table.action.${selectedAuditLog.action}`)}</Badge>
          <span className="text-sm text-muted-foreground">{selectedAuditLog?.createdBy?.name}</span>
          <span className="text-xs text-muted-foreground ml-auto">{selectedAuditLog.createdAt.toLocaleString()}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <ChangeRow change={change} />
        </div>
      </CardContent>
    </Card>
  )
}

export function ActionBar() {
  const { t } = useTranslation()
  const { isModalOpen, closeModal, selectedAuditLog } = useAuditLogsContext()

  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('page.audit-logs.title')}</h2>
        <p className="text-muted-foreground">{t('page.audit-logs.description')}</p>
      </div>
      <PermissionGate permission={['language.create']}>
        <Sheet open={isModalOpen} onOpenChange={() => closeModal()}>
          <SheetContent className="sm:max-w-xl w-full overflow-y-auto" side="right">
            <SheetHeader>
              <SheetTitle>{t(`page.audit-logs.form.title`)}</SheetTitle>
              <SheetDescription>
                {t(`page.audit-logs.form.description`)}
              </SheetDescription>
            </SheetHeader>
            <div className="w-full pb-4 px-4">
              {selectedAuditLog && selectedAuditLog.changes.map(change => (
                <AuditLogChanges key={change.path} selectedAuditLog={selectedAuditLog} change={change} />
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </PermissionGate>
    </div>
  )
}
