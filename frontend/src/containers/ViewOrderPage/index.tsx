import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'

import { ViewOrderProvider } from '@/contexts'

import { ActionBar } from './components/action-bar'
import { DataTable } from './components/data-table'

export function ViewOrderPage() {
  const { t } = useTranslation()

  return (
    <>
      <Helmet>
        <title>{t('title.page.view-order')}</title>
        <meta name="description" content={t('description.page.view-order')} />
      </Helmet>
      <ViewOrderProvider>
        <ActionBar />
        <DataTable />
      </ViewOrderProvider>
    </>
  )
}
