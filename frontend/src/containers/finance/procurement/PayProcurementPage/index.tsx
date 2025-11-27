import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'

import { ActionBar } from './components/action-bar'
import { PayProcurementForm } from './components/form'
import { PayProcurementInfo } from './components/procurement-info'
import { PayProcurementProvider } from './context'

export function PayProcurementPage() {
  const { t } = useTranslation()

  return (
    <>
      <Helmet>
        <title>{t('title.page.procurement.pay')}</title>
        <meta name="description" content={t('description.page.procurement.pay')} />
      </Helmet>
      <PayProcurementProvider>
        <ActionBar />
        <div className="flex flex-wrap justify-between gap-4 mt-6">
          <PayProcurementInfo />
          <PayProcurementForm />
        </div>
      </PayProcurementProvider>
    </>
  )
}
