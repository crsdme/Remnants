import { Plus } from 'lucide-react'

import { useTranslation } from 'react-i18next'
import { PermissionGate } from '@/components'
import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui'
import { useBarcodeContext } from '@/contexts'

import { BarcodeForm } from './form'

export function ActionBar() {
  const { t } = useTranslation()
  const barcodeContext = useBarcodeContext()

  const { isLoading, isEdit } = barcodeContext

  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('page.barcodes.title')}</h2>
        <p className="text-muted-foreground">{t('page.barcodes.description')}</p>
      </div>
      <div className="flex items-center flex-wrap gap-2">
        <PermissionGate permission={['barcode.create', 'barcode.edit']}>
          <Dialog open={barcodeContext.isModalOpen} onOpenChange={barcodeContext.closeModal}>
            <DialogTrigger asChild>
              <Button
                onClick={() => barcodeContext.openModal()}
                disabled={isLoading}
              >
                <Plus />
                {t('page.barcodes.button.create')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-11/12 w-full overflow-y-auto max-w-11/12 max-h-[95vh]">
              <DialogHeader>
                <DialogTitle>
                  {t(`page.barcodes.form.title.${isEdit ? 'edit' : 'create'}`)}
                </DialogTitle>
                <DialogDescription>
                  {t(`page.barcodes.form.description.${isEdit ? 'edit' : 'create'}`)}
                </DialogDescription>
              </DialogHeader>
              <div className="w-full">
                <BarcodeForm />
              </div>
            </DialogContent>
          </Dialog>
        </PermissionGate>
      </div>
    </div>
  )
}
