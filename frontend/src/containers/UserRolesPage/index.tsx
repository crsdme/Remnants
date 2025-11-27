import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'

import { ActionBar } from './components/action-bar'

import { DataTable } from './components/data-table'
import { UserRoleProvider } from './context'

export function UserRolesPage() {
  const { t } = useTranslation()

  return (
    <>
      <Helmet>
        <title>{t('title.page.userRoles')}</title>
        <meta name="description" content={t('description.page.userRoles')} />
      </Helmet>
      <UserRoleProvider>
        <ActionBar />
        <DataTable />
      </UserRoleProvider>
    </>
  )
}
