import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'

import { BarcodeForm } from '../components/form'
import { ActionBar } from './components/action-bar'
import { EditBarcodeProvider } from './context'

export function EditBarcodePage() {
  const { t } = useTranslation()

  return (
    <>
      <Helmet>
        <title>{t('title.page.barcode-edit')}</title>
        <meta name="description" content={t('description.page.barcode-edit')} />
      </Helmet>
      <EditBarcodeProvider>
        <ActionBar />
        <BarcodeForm />
      </EditBarcodeProvider>
    </>
  )
}
