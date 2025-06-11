import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'

import { ProductPropertiesProvider } from '@/contexts'
import { ActionBar } from './components/action-bar'

import { DataTable } from './components/data-table'

export function ProductPropertiesPage() {
  const { t } = useTranslation()

  return (
    <>
      <Helmet>
        <title>{t('title.page.product-properties')}</title>
        <meta name="description" content={t('description.page.product-properties')} />
      </Helmet>
      <ProductPropertiesProvider>
        <ActionBar />
        <DataTable />
      </ProductPropertiesProvider>
    </>
  )
}
