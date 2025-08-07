import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'

import { EditOrderProvider } from '@/contexts'

import { ActionBar } from './components/action-bar'
import { DataTable } from './components/data-table'

export function EditOrderPage() {
  const { t } = useTranslation()

  return (
    <>
      <Helmet>
        <title>{t('title.page.edit-order')}</title>
        <meta name="description" content={t('description.page.edit-order')} />
      </Helmet>
      <EditOrderProvider>
        <ActionBar />
        <DataTable />
      </EditOrderProvider>
    </>
  )
}
