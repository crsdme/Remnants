import { UserProvider } from '@/utils/contexts'
import { Helmet } from 'react-helmet'

import { useTranslation } from 'react-i18next'
import { ActionBar } from './components/action-bar'

import { DataTable } from './components/data-table'

export function UsersPage() {
  const { t } = useTranslation()

  return (
    <>
      <Helmet>
        <title>{t('title.page.users')}</title>
        <meta name="description" content={t('description.page.users')} />
      </Helmet>
      <UserProvider>
        <ActionBar />
        <DataTable />
      </UserProvider>
    </>
  )
}
