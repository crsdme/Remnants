import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'

import { InventoryProvider } from '@/contexts'

import { ActionBar } from './components/action-bar'
import { DataTable } from './components/data-table'

export function InventoriesPage() {
  const { t } = useTranslation()

  return (
    <>
      <Helmet>
        <title>{t('title.page.inventories')}</title>
        <meta name="description" content={t('description.page.inventories')} />
      </Helmet>
      <InventoryProvider>
        <ActionBar />
        <DataTable />
      </InventoryProvider>
    </>
  )
}
