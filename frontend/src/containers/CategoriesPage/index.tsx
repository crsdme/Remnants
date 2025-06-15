import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'

import { CategoryProvider } from '@/contexts'
import { ActionBar } from './components/action-bar'
import { DataTable } from './components/data-table'

export function CategoriesPage() {
  const { t } = useTranslation()

  return (
    <>
      <Helmet>
        <title>{t('title.page.categories')}</title>
        <meta name="description" content={t('description.page.categories')} />
      </Helmet>
      <CategoryProvider>
        <ActionBar />
        <DataTable />
      </CategoryProvider>
    </>
  )
}
