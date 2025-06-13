import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'

import { WarehouseProvider } from '@/contexts'
import { ActionBar } from './components/action-bar'
import { DataTable } from './components/data-table'

export function WarehousesPage() {
  const { t } = useTranslation()

  return (
    <>
      <Helmet>
        <title>{t('title.page.warehouses')}</title>
        <meta name="description" content={t('description.page.warehouses')} />
      </Helmet>
      <WarehouseProvider>
        <ActionBar />
        <DataTable />
      </WarehouseProvider>
    </>
  )
}
