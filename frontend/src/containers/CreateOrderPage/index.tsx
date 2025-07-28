import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'

import { CreateOrderProvider } from '@/contexts'

import { ActionBar } from './components/action-bar'
import { DataTable } from './components/data-table'

export function CreateOrderPage() {
  const { t } = useTranslation()

  return (
    <>
      <Helmet>
        <title>{t('title.page.create-order')}</title>
        <meta name="description" content={t('description.page.create-order')} />
      </Helmet>
      <CreateOrderProvider>
        <ActionBar />
        <DataTable />
      </CreateOrderProvider>
    </>
  )
}
