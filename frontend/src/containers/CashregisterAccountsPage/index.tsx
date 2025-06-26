import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'

import { CashregisterAccountProvider } from '@/contexts'

import { ActionBar } from './components/action-bar'
import { DataTable } from './components/data-table'

export function CashregisterAccountsPage() {
  const { t } = useTranslation()

  return (
    <>
      <Helmet>
        <title>{t('title.page.cashregister-accounts')}</title>
        <meta name="description" content={t('description.page.cashregister-accounts')} />
      </Helmet>
      <CashregisterAccountProvider>
        <ActionBar />
        <DataTable />
      </CashregisterAccountProvider>
    </>
  )
}
