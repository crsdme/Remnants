import { ArrowLeft } from 'lucide-react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui'
import { cn } from '@/utils/lib/utils'
import { useLocale } from '@/utils/hooks'
import { PreviewStep } from './components/preview-step'
import { UploadStep } from './components/upload-step'
import { ProductsImportProvider, useProductsImportContext } from './context'

function ProductsImportContent() {
  const { t } = useLocale()
  const { step } = useProductsImportContext()
  const isPreview = step === 'preview'

  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        isPreview && 'h-[calc(100svh-5.5rem)] min-h-0',
      )}
    >
      <div className="shrink-0 space-y-2">
        <Button variant="ghost" size="sm" className="-ml-2 h-8 px-2 text-muted-foreground" asChild>
          <Link to="/products">
            <ArrowLeft className="mr-1 h-4 w-4" />
            {t('page.productsImport.back')}
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('page.productsImport.title')}</h2>
          <p className="text-muted-foreground">
            {isPreview
              ? t('page.productsImport.preview.description')
              : t('page.productsImport.description')}
          </p>
        </div>
      </div>

      {isPreview ? <PreviewStep /> : <UploadStep />}
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
