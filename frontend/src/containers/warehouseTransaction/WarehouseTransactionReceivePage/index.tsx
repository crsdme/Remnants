import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'

import { ActionBar } from './components/action-bar'
import { WarehouseTransactionForm } from './components/form'
import { WarehouseTransactionProvider } from './context'

export function WarehouseTransactionReceivePage() {
  const { t } = useTranslation()

  return (
    <>
      <Helmet>
        <title>{t('title.page.warehouse-transaction-receive')}</title>
        <meta name="description" content={t('description.page.warehouse-transaction-receive')} />
      </Helmet>
      <WarehouseTransactionProvider>
        <ActionBar />
        <WarehouseTransactionForm />
      </WarehouseTransactionProvider>
    </>
  )
}
