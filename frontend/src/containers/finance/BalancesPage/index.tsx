import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'

import { ActionBar } from './components/action-bar'
import { DataTable } from './components/data-table'
import { BalanceProvider } from './context'

export function BalancesPage() {
  const { t } = useTranslation()

  return (
    <>
      <Helmet>
        <title>{t('title.page.balances')}</title>
        <meta name="description" content={t('description.page.balances')} />
      </Helmet>
      <BalanceProvider>
        <ActionBar />
        <DataTable />
      </BalanceProvider>
    </>
  )
}
