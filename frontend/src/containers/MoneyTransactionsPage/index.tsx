import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'

import { ActionBar } from './components/action-bar'
import { DataTable } from './components/data-table'
import { MoneyTransactionProvider } from './context'

export function MoneyTransactionsPage() {
  const { t } = useTranslation()

  return (
    <>
      <Helmet>
        <title>{t('title.page.money-transactions')}</title>
        <meta name="description" content={t('description.page.money-transactions')} />
      </Helmet>
      <MoneyTransactionProvider>
        <ActionBar />
        <DataTable />
      </MoneyTransactionProvider>
    </>
  )
}
