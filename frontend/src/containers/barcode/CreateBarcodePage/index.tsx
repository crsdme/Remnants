import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'

import { BarcodeForm } from '../components/form'
import { ActionBar } from './components/action-bar'
import { CreateBarcodeProvider } from './context'

export function CreateBarcodePage() {
  const { t } = useTranslation()

  return (
    <>
      <Helmet>
        <title>{t('title.page.barcode-create')}</title>
        <meta name="description" content={t('description.page.barcode-create')} />
      </Helmet>
      <CreateBarcodeProvider>
        <ActionBar />
        <BarcodeForm />
      </CreateBarcodeProvider>
    </>
  )
}
