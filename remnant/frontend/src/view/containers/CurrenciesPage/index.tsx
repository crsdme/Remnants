import { CurrencyProvider } from '@/utils/contexts'
import { Helmet } from 'react-helmet-async'

import { useTranslation } from 'react-i18next'
import { ActionBar } from './components/action-bar'

import { DataTable } from './components/data-table'

export function CurrenciesPage() {
  const { t } = useTranslation()

  return (
    <>
      <Helmet>
        <title>{t('title.page.currencies')}</title>
        <meta name="description" content={t('description.page.currencies')} />
      </Helmet>
      <CurrencyProvider>
        <ActionBar />
        <DataTable />
      </CurrencyProvider>
    </>
  )
}
