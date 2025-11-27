import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'

import { ActionBar } from './components/action-bar'
import { DataTable } from './components/data-table'
import { WarehouseTransactionProvider } from './context'

export function WarehouseTransactionsPage() {
  const { t } = useTranslation()

  return (
    <>
      <Helmet>
        <title>{t('title.page.warehouse-transactions')}</title>
        <meta name="description" content={t('description.page.warehouse-transactions')} />
      </Helmet>
      <WarehouseTransactionProvider>
        <ActionBar />
        <DataTable />
      </WarehouseTransactionProvider>
    </>
  )
}
