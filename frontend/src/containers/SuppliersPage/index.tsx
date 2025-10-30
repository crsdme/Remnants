import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'

import { ActionBar } from './components/action-bar'
import { DataTable } from './components/data-table'
import { SupplierProvider } from './context'

export function SuppliersPage() {
  const { t } = useTranslation()

  return (
    <>
      <Helmet>
        <title>{t('title.page.suppliers')}</title>
        <meta name="description" content={t('description.page.suppliers')} />
      </Helmet>
      <SupplierProvider>
        <ActionBar />
        <DataTable />
      </SupplierProvider>
    </>
  )
}
