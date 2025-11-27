import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'

import { ActionBar } from './components/action-bar'
import { DataTable } from './components/data-table'
import { ProcurementProvider } from './context'

export function ProcurementsPage() {
  const { t } = useTranslation()

  return (
    <>
      <Helmet>
        <title>{t('title.page.procurements')}</title>
        <meta name="description" content={t('description.page.procurements')} />
      </Helmet>
      <ProcurementProvider>
        <ActionBar />
        <DataTable />
      </ProcurementProvider>
    </>
  )
}
