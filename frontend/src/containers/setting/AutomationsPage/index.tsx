import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'

import { AutomationProvider } from '@/contexts'

import { ActionBar } from './components/action-bar'
import { DataTable } from './components/data-table'

export function AutomationsPage() {
  const { t } = useTranslation()

  return (
    <>
      <Helmet>
        <title>{t('title.page.automations')}</title>
        <meta name="description" content={t('description.page.automations')} />
      </Helmet>
      <AutomationProvider>
        <ActionBar />
        <DataTable />
      </AutomationProvider>
    </>
  )
}
