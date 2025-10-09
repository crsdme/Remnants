import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'

import { AuditLogsProvider } from '@/contexts'

import { ActionBar } from './components/action-bar'
import { DataTable } from './components/data-table'

export function AuditLogsPage() {
  const { t } = useTranslation()

  return (
    <>
      <Helmet>
        <title>{t('title.page.audit-logs')}</title>
        <meta name="description" content={t('description.page.audit-logs')} />
      </Helmet>
      <AuditLogsProvider>
        <ActionBar />
        <DataTable />
      </AuditLogsProvider>
    </>
  )
}
