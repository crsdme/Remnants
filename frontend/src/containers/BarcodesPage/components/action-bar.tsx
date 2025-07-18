import { Plus } from 'lucide-react'

import { useTranslation } from 'react-i18next'
import { PermissionGate } from '@/components'
import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui'
import { useBarcodeContext } from '@/contexts'

import { BarcodeForm } from './form'

export function ActionBar() {
  const { t } = useTranslation()
  const { isLoading, isEdit, isModalOpen, closeModal, openModal } = useBarcodeContext()

  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('page.barcodes.title')}</h2>
        <p className="text-muted-foreground">{t('page.barcodes.description')}</p>
      </div>
      <div className="flex items-center flex-wrap gap-2">
        <PermissionGate permission={['barcode.create', 'barcode.edit']}>
          <Dialog open={isModalOpen} onOpenChange={closeModal}>
            <DialogTrigger asChild>
              <Button
                onClick={() => openModal()}
                disabled={isLoading}
              >
                <Plus />
                {t('page.barcodes.button.create')}
              </Button>
            </DialogTrigger>
            <DialogContent className="flex flex-col min-w-[98vw] max-w-[98vw] max-h-[98vh] overflow-y-auto sm:max-w-[85vw] sm:min-w-[85vw]">
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
