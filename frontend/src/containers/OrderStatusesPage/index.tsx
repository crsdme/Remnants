import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'

import { OrderStatusProvider } from '@/contexts'

import { ActionBar } from './components/action-bar'
import { DataTable } from './components/data-table'

export function OrderStatusesPage() {
  const { t } = useTranslation()

  return (
    <>
      <Helmet>
        <title>{t('title.page.order-statuses')}</title>
        <meta name="description" content={t('description.page.order-statuses')} />
      </Helmet>
      <OrderStatusProvider>
        <ActionBar />
        <DataTable />
      </OrderStatusProvider>
    </>
  )
}
