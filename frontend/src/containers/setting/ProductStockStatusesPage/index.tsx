import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'

import { ActionBar } from './components/action-bar'
import { DataTable } from './components/data-table'
import { ProductStockStatusProvider } from './context'

export function ProductStockStatusesPage() {
  const { t } = useTranslation()

  return (
    <>
      <Helmet>
        <title>{t('title.page.product-stock-statuses')}</title>
        <meta name="description" content={t('description.page.product-stock-statuses')} />
      </Helmet>
      <ProductStockStatusProvider>
        <ActionBar />
        <DataTable />
      </ProductStockStatusProvider>
    </>
  )
}
