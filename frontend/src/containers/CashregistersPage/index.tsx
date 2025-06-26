import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'

import { CashregisterProvider } from '@/contexts'

import { ActionBar } from './components/action-bar'
import { DataTable } from './components/data-table'

export function CashregistersPage() {
  const { t } = useTranslation()

  return (
    <>
      <Helmet>
        <title>{t('title.page.cashregisters')}</title>
        <meta name="description" content={t('description.page.cashregisters')} />
      </Helmet>
      <CashregisterProvider>
        <ActionBar />
        <DataTable />
      </CashregisterProvider>
    </>
  )
}
