import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'

import { ActionBar } from './components/action-bar'
import { DataTable } from './components/data-table'
import { ExpenseProvider } from './context'

export function ExpensesPage() {
  const { t } = useTranslation()

  return (
    <>
      <Helmet>
        <title>{t('title.page.expenses')}</title>
        <meta name="description" content={t('description.page.expenses')} />
      </Helmet>
      <ExpenseProvider>
        <ActionBar />
        <DataTable />
      </ExpenseProvider>
    </>
  )
}
