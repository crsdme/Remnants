import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'

import { ActionBar } from './components/action-bar'
import { ViewSupplierDetails } from './components/details'
import { ViewSupplierProvider } from './context'

export function ViewSupplierPage() {
  const { t } = useTranslation()

  return (
    <>
      <Helmet>
        <title>{t('title.page.supplier.view')}</title>
        <meta name="description" content={t('description.page.supplier.view')} />
      </Helmet>
      <ViewSupplierProvider>
        <ActionBar />
        <ViewSupplierDetails />
      </ViewSupplierProvider>
    </>
  )
}
