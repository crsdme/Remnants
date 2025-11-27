import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'

import { ActionBar } from './components/action-bar'

import { DataTable } from './components/data-table'
import { OrderProvider } from './context'

export function OrdersPage() {
  const { t } = useTranslation()

  return (
    <>
      <Helmet>
        <title>{t('title.page.orders')}</title>
        <meta name="description" content={t('description.page.orders')} />
      </Helmet>
      <OrderProvider>
        <ActionBar />
        <DataTable />
      </OrderProvider>
    </>
  )
}
