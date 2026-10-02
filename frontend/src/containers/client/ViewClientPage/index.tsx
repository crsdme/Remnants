import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { ActionBar } from './components/action-bar'
import { ViewClientDetails } from './components/details'
import { ViewClientProvider } from './context'

export function ViewClientPage() {
  const { t } = useTranslation()

  return (
    <>
      <Helmet>
        <title>{t('title.page.client.view')}</title>
        <meta name="description" content={t('description.page.client.view')} />
      </Helmet>
      <ViewClientProvider>
        <ActionBar />
        <ViewClientDetails />
      </ViewClientProvider>
    </>
  )
}
