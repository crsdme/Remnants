import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'

import { LanguageProvider } from '@/utils/contexts'
import { ActionBar } from './components/action-bar'

import { DataTable } from './components/data-table'

export function LanguagesPage() {
  const { t } = useTranslation()

  return (
    <>
      <Helmet>
        <title>{t('title.page.languages')}</title>
        <meta name="description" content={t('description.page.languages')} />
      </Helmet>
      <LanguageProvider>
        <ActionBar />
        <DataTable />
      </LanguageProvider>
    </>
  )
}
