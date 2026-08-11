import type { AuditLogPopulatedDTO } from '@remnant/shared'
import { ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AuditChangesList, PermissionGate } from '@/components'
import {
  Badge,
  Button,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui'
import { formatDate } from '@/utils/helpers'
import { useLocale } from '@/utils/hooks'
import { useAuditLogsContext } from '../context'
import { getAuditLogEntityPath } from '../utils'

export function ActionBar() {
  const { t } = useTranslation()
  const { language } = useLocale()
  const { isModalOpen, closeModal, selectedAuditLog } = useAuditLogsContext()

  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('page.audit-logs.title')}</h2>
        <p className="text-muted-foreground">{t('page.audit-logs.description')}</p>
      </div>
      <PermissionGate permission={['audit-log.view']}>
        <Sheet open={isModalOpen} onOpenChange={() => closeModal()}>
          <SheetContent className="sm:max-w-xl w-full overflow-y-auto" side="right">
            <SheetHeader>
              <SheetTitle>{t('page.audit-logs.form.title')}</SheetTitle>
              <SheetDescription>
                {t('page.audit-logs.form.description')}
              </SheetDescription>
            </SheetHeader>
            <div className="w-full space-y-3 pb-4 px-4">
              {selectedAuditLog && (
                <AuditLogDetails auditLog={selectedAuditLog} language={language} />
              )}
            </div>
          </SheetContent>
        </Sheet>
      </PermissionGate>
    </div>
  )
}

function AuditLogDetails({
  auditLog,
  language,
}: {
  auditLog: AuditLogPopulatedDTO
  language: string
}) {
  const { t } = useTranslation()
  const entityPath = getAuditLogEntityPath(auditLog)

  return (
    <div className="rounded-lg border border-border p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">{t(`page.audit-logs.table.action.${auditLog.action}`)}</Badge>
        <Badge variant="outline">{t(`page.audit-logs.table.resourceType.${auditLog.resourceType}`)}</Badge>
        {auditLog.createdBy?.name && (
          <Badge variant="secondary" className="text-xs">{auditLog.createdBy.name}</Badge>
        )}
        <span className="ml-auto font-mono text-xs text-muted-foreground">
          {formatDate(auditLog.createdAt, 'dd.MM.yyyy HH:mm', language)}
        </span>
      </div>
      {entityPath && (
        <Button size="sm" variant="outline" asChild>
          <Link to={entityPath}>
            <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
            {t('page.audit-logs.table.openEntity')}
          </Link>
        </Button>
      )}
      <AuditChangesList changes={auditLog.changes} />
    </div>
  )
}
