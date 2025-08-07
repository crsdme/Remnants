import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'

import { OrderProvider } from '@/contexts'

import { ActionBar } from './components/action-bar'
import { DataTable } from './components/data-table'

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
