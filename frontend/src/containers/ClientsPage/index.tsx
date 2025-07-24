import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'

import { ClientProvider } from '@/contexts'

import { ActionBar } from './components/action-bar'
import { DataTable } from './components/data-table'

export function ClientsPage() {
  const { t } = useTranslation()

  return (
    <>
      <Helmet>
        <title>{t('title.page.clients')}</title>
        <meta name="description" content={t('description.page.clients')} />
      </Helmet>
      <ClientProvider>
        <ActionBar />
        <DataTable />
      </ClientProvider>
    </>
  )
}
