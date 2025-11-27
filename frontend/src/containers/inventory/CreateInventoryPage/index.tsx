import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'

import { ActionBar } from './components/action-bar'
import { DataTable } from './components/data-table'
import { CreateInventoryProvider } from './context'

export function CreateInventoryPage() {
  const { t } = useTranslation()

  return (
    <>
      <Helmet>
        <title>{t('title.page.create-inventory')}</title>
        <meta name="description" content={t('description.page.create-inventory')} />
      </Helmet>
      <CreateInventoryProvider>
        <ActionBar />
        <DataTable />
      </CreateInventoryProvider>
    </>
  )
}
