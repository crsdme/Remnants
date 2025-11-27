import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'

import { ActionBar } from './components/action-bar'
import { DataTable } from './components/data-table'
import { OrderStatisticProvider } from './context'

export function OrderStatisticPage() {
  const { t } = useTranslation()

  return (
    <>
      <Helmet>
        <title>{t('title.page.order-statistic')}</title>
        <meta name="description" content={t('description.page.order-statistic')} />
      </Helmet>
      <OrderStatisticProvider>
        <ActionBar />
        <DataTable />
      </OrderStatisticProvider>
    </>
  )
}
