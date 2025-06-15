import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'

import { BarcodeProvider } from '@/contexts'
import { ActionBar } from './components/action-bar'
import { DataTable } from './components/data-table'

export function BarcodesPage() {
  const { t } = useTranslation()

  return (
    <>
      <Helmet>
        <title>{t('title.page.barcodes')}</title>
        <meta name="description" content={t('description.page.barcodes')} />
      </Helmet>
      <BarcodeProvider>
        <ActionBar />
        <DataTable />
      </BarcodeProvider>
    </>
  )
}
