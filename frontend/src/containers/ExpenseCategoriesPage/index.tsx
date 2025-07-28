import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'

import { ExpenseCategoryProvider } from '@/contexts'

import { ActionBar } from './components/action-bar'
import { DataTable } from './components/data-table'

export function ExpenseCategoriesPage() {
  const { t } = useTranslation()

  return (
    <>
      <Helmet>
        <title>{t('title.page.expense-categories')}</title>
        <meta name="description" content={t('description.page.expense-categories')} />
      </Helmet>
      <ExpenseCategoryProvider>
        <ActionBar />
        <DataTable />
      </ExpenseCategoryProvider>
    </>
  )
}
