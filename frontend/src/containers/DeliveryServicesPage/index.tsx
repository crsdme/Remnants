import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'

import { DeliveryServiceProvider } from '@/contexts'

import { ActionBar } from './components/action-bar'
import { DataTable } from './components/data-table'

export function DeliveryServicesPage() {
  const { t } = useTranslation()

  return (
    <>
      <Helmet>
        <title>{t('title.page.delivery-services')}</title>
        <meta name="description" content={t('description.page.delivery-services')} />
      </Helmet>
      <DeliveryServiceProvider>
        <ActionBar />
        <DataTable />
      </DeliveryServiceProvider>
    </>
  )
}
