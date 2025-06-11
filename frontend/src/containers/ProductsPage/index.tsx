import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'

import { ProductProvider } from '@/contexts'
import { ActionBar } from './components/action-bar'

import { DataTable } from './components/data-table'

export function ProductsPage() {
  const { t } = useTranslation()

  return (
    <>
      <Helmet>
        <title>{t('title.page.products')}</title>
        <meta name="description" content={t('description.page.products')} />
      </Helmet>
      <ProductProvider>
        <ActionBar />
        <DataTable />
      </ProductProvider>
    </>
  )
}
