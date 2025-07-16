import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'

import { DeliveryStatusProvider } from '@/contexts'

import { ActionBar } from './components/action-bar'
import { DataTable } from './components/data-table'

export function DeliveryStatusesPage() {
  const { t } = useTranslation()

  return (
    <>
      <Helmet>
        <title>{t('title.page.delivery-statuses')}</title>
        <meta name="description" content={t('description.page.delivery-statuses')} />
      </Helmet>
      <DeliveryStatusProvider>
        <ActionBar />
        <DataTable />
      </DeliveryStatusProvider>
    </>
  )
}
