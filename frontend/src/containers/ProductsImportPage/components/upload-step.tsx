import { Download, FileSpreadsheet } from 'lucide-react'

import { FileUpload } from '@/components'
import { Button, Label } from '@/components/ui'
import { useLocale } from '@/utils/hooks'
import { useProductsImportContext } from '../context'

export function UploadStep() {
  const { t } = useLocale()
  const { file, isPreviewLoading, setFile, downloadTemplate, runPreview } = useProductsImportContext()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files?.[0] ?? null)
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="rounded-md border p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="rounded-md border bg-muted/40 p-2">
            <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h3 className="font-medium leading-none">{t('page.productsImport.upload.title')}</h3>
            <p className="text-sm text-muted-foreground">{t('page.productsImport.upload.hint')}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t('page.productsImport.upload.label')}</Label>
          <FileUpload handleFileChange={handleFileChange} accept=".csv,.xlsx,.xls,.json" />
          <p className="text-sm text-muted-foreground">{t('page.productsImport.upload.formats')}</p>
          {file && (
            <p className="text-sm">
              {t('page.productsImport.upload.selected', { name: file.name })}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button type="button" disabled={!file} loading={isPreviewLoading} onClick={runPreview}>
            {t('page.productsImport.upload.preview')}
          </Button>
          <Button variant="outline" type="button" onClick={downloadTemplate}>
            <Download className="mr-2 h-4 w-4" />
            {t('page.productsImport.upload.template')}
          </Button>
        </div>
      </div>
    </div>
  )
}
