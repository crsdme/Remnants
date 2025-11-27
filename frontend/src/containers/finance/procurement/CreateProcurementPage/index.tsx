import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'

import { ActionBar } from './components/action-bar'
import { DataTable } from './components/data-table'
import { CreateProcurementProvider } from './context'

export function CreateProcurementPage() {
  const { t } = useTranslation()

  return (
    <>
      <Helmet>
        <title>{t('title.page.procurement.create')}</title>
        <meta name="description" content={t('description.page.procurement.create')} />
      </Helmet>
      <CreateProcurementProvider>
        <ActionBar />
        <DataTable />
      </CreateProcurementProvider>
    </>
  )
}
