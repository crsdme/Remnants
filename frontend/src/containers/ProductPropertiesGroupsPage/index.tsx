import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'

import { ProductPropertiesGroupsProvider } from '@/contexts'

import { ActionBar } from './components/action-bar'
import { DataTable } from './components/data-table'

export function ProductPropertiesGroupsPage() {
  const { t } = useTranslation()

  return (
    <>
      <Helmet>
        <title>{t('title.page.product-properties-groups')}</title>
        <meta name="description" content={t('description.page.product-properties-groups')} />
      </Helmet>
      <ProductPropertiesGroupsProvider>
        <ActionBar />
        <DataTable />
      </ProductPropertiesGroupsProvider>
    </>
  )
}
