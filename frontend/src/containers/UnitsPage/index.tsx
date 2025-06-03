import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'

import { UnitProvider } from '@/utils/contexts'
import { ActionBar } from './components/action-bar'

import { DataTable } from './components/data-table'

export function UnitsPage() {
  const { t } = useTranslation()

  return (
    <>
      <Helmet>
        <title>{t('title.page.units')}</title>
        <meta name="description" content={t('description.page.units')} />
      </Helmet>
      <UnitProvider>
        <ActionBar />
        <DataTable />
      </UnitProvider>
    </>
  )
}
