import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'

import { ActionBar } from './components/action-bar'
import { CreateInventoryForm } from './components/form'
import { CreateInventoryProvider } from './context'

export function CreateInventoryPage() {
  const { t } = useTranslation()

  return (
    <>
      <Helmet>
        <title>{t('title.page.create-inventory')}</title>
        <meta name="description" content={t('description.page.create-inventory')} />
      </Helmet>
      <CreateInventoryProvider>
        <div className="space-y-4">
          <ActionBar />
          <CreateInventoryForm />
        </div>
      </CreateInventoryProvider>
    </>
  )
}
