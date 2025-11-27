import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'

import { ActionBar } from './components/action-bar'

import { DataTable } from './components/data-table'
import { OrderSourceProvider } from './context'

export function OrderSourcesPage() {
  const { t } = useTranslation()

  return (
    <>
      <Helmet>
        <title>{t('title.page.order-sources')}</title>
        <meta name="description" content={t('description.page.order-sources')} />
      </Helmet>
      <OrderSourceProvider>
        <ActionBar />
        <DataTable />
      </OrderSourceProvider>
    </>
  )
}
