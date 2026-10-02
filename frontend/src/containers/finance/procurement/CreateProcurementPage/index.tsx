import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import { ActionBar } from './components/action-bar'
import { DataTable } from './components/data-table'
import { CreateProcurementProvider } from './context'

export function CreateProcurementPage() {
  const { t } = useTranslation()
  const { seq } = useParams()
  const isEdit = Number(seq) > 0

  return (
    <>
      <Helmet>
        <title>{t(isEdit ? 'title.page.procurement.edit' : 'title.page.procurement.create')}</title>
        <meta name="description" content={t(isEdit ? 'description.page.procurement.edit' : 'description.page.procurement.create')} />
      </Helmet>
      <CreateProcurementProvider>
        <ActionBar />
        <DataTable />
      </CreateProcurementProvider>
    </>
  )
}
