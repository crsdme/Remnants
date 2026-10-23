import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ImportButton, PermissionGate } from '@/components'
import {
  Button,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui'
import { useAuthContext } from '@/contexts'
import { hasPermission } from '@/utils/helpers/permission'
import { useProductContext } from '../context'
import { ProductForm } from './form'
import { LogsSheet } from './logs-sheet'

export function ActionBar() {
  const { t } = useTranslation()
  const [file, setFile] = useState<File | null>(null)
  const { permissions } = useAuthContext()

  const {
    isLoading,
    isModalOpen,
    isEdit,
    downloadTemplate,
    importProducts,
    openModal,
    closeModal,
  } = useProductContext()

  const canCreate = hasPermission(permissions, 'product.create')
  const canEdit = hasPermission(permissions, 'product.edit')
  const canOpenForm = canCreate || canEdit

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFile(file)
    }
  }

  const handleDownloadTemplate = () => {
    downloadTemplate()
  }

  const onImport = () => {
    const formData = new FormData()
    formData.append('file', file as File)
    importProducts({ file: file as File })
    setFile(null)
  }

  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('page.products.title')}</h2>
        <p className="text-muted-foreground">{t('page.products.description')}</p>
      </div>
      <div className="flex items-center flex-wrap gap-2">
        <PermissionGate permission="product.import">
          <ImportButton
            handleFileChange={handleFileChange}
            handleDownloadTemplate={handleDownloadTemplate}
            isFileSelected={!!file}
            isLoading={isLoading}
            onSubmit={onImport}
          />
        </PermissionGate>
        {canOpenForm && (
          <Sheet open={isModalOpen} onOpenChange={closeModal}>
            {canCreate && (
              <SheetTrigger asChild>
                <Button onClick={() => openModal()} disabled={isLoading}>
                  <Plus />
                  {t('page.products.button.create')}
                </Button>
              </SheetTrigger>
            )}
            <SheetContent className="sm:max-w-xl w-full overflow-y-auto" side="right">
              <SheetHeader>
                <SheetTitle>{t(`page.products.form.title.${isEdit ? 'edit' : 'create'}`)}</SheetTitle>
                <SheetDescription>
                  {t(`page.products.form.description.${isEdit ? 'edit' : 'create'}`)}
                </SheetDescription>
              </SheetHeader>
              <div className="w-full pb-4 px-4">
                <ProductForm />
              </div>
            </SheetContent>
          </Sheet>
        )}
        <PermissionGate permission={['product.quantityLogs', 'product.auditLogs']}>
          <LogsSheet />
        </PermissionGate>
      </div>
    </div>
  )
}
