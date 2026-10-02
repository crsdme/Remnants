import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'

import { ActionBar } from './components/action-bar'
import { ViewProcurementDetails } from './components/details'
import { ViewProcurementProvider } from './context'

export function ViewProcurementPage() {
  const { t } = useTranslation()

  return (
    <>
      <Helmet>
        <title>{t('title.page.procurement.view')}</title>
        <meta name="description" content={t('description.page.procurement.view')} />
      </Helmet>
      <ViewProcurementProvider>
        <ActionBar />
        <ViewProcurementDetails />
      </ViewProcurementProvider>
    </>
  )
}
