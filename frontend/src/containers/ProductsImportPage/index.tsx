import { ArrowLeft } from 'lucide-react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui'
import { useLocale } from '@/utils/hooks'
import { PreviewStep } from './components/preview-step'
import { UploadStep } from './components/upload-step'
import { ProductsImportProvider, useProductsImportContext } from './context'

function ProductsImportContent() {
  const { t } = useLocale()
  const { step } = useProductsImportContext()

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="space-y-2">
          <Button variant="ghost" size="sm" className="-ml-2 h-8 px-2 text-muted-foreground" asChild>
            <Link to="/products">
              <ArrowLeft className="mr-1 h-4 w-4" />
              {t('page.productsImport.back')}
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t('page.productsImport.title')}</h2>
            <p className="text-muted-foreground">
              {step === 'upload'
                ? t('page.productsImport.description')
                : t('page.productsImport.preview.description')}
            </p>
          </div>
        </div>
      </div>

      {step === 'upload' ? <UploadStep /> : <PreviewStep />}
    </div>
  )
}

export function ProductsImportPage() {
  const { t } = useLocale()

  return (
    <>
      <Helmet>
        <title>{t('title.page.productsImport')}</title>
        <meta name="description" content={t('description.page.productsImport')} />
      </Helmet>
      <ProductsImportProvider>
        <ProductsImportContent />
      </ProductsImportProvider>
    </>
  )
}
