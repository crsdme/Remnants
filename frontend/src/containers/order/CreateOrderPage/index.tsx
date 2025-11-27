import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'

import { ActionBar } from './components/action-bar'
import { DataTable } from './components/data-table'
import { CreateOrderProvider } from './context'

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
