import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'

import { ActionBar } from './components/action-bar'
import { DataTable } from './components/data-table'
import { ViewInventoryProvider } from './context'

export function ViewInventoryPage() {
  const { t } = useTranslation()

  return (
    <>
      <Helmet>
        <title>{t('title.page.view-inventory')}</title>
        <meta name="description" content={t('description.page.view-inventory')} />
      </Helmet>
      <ViewInventoryProvider>
        <ActionBar />
        <DataTable />
      </ViewInventoryProvider>
    </>
  )
}
