import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'

import { ActionBar } from './components/action-bar'
import { DataTable } from './components/data-table'
import { SiteProvider } from './context'

export function SitesPage() {
  const { t } = useTranslation()

  return (
    <>
      <Helmet>
        <title>{t('title.page.sites')}</title>
        <meta name="description" content={t('description.page.sites')} />
      </Helmet>
      <SiteProvider>
        <ActionBar />
        <DataTable />
      </SiteProvider>
    </>
  )
}
