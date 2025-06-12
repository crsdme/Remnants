import { Plus } from 'lucide-react'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ImportButton, PermissionGate } from '@/components'
import { Button, Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui'
import { useCategoryContext } from '@/contexts'

import { CategoryForm } from './form'

export function ActionBar() {
  const { t } = useTranslation()
  const categoryContext = useCategoryContext()
  const [file, setFile] = useState<File | null>(null)

  const { isLoading, isEdit } = categoryContext

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFile(file)
    }
  }

  const handleDownloadTemplate = async () => {
    categoryContext.exportCategories({ ids: [] })
  }

  const onImport = async () => {
    const formData = new FormData()
    formData.append('file', file)
    categoryContext.importCategories(formData)
    setFile(null)
  }

  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('page.categories.title')}</h2>
        <p className="text-muted-foreground">{t('page.categories.description')}</p>
      </div>
      <div className="flex items-center flex-wrap gap-2">
        <PermissionGate permission="category.import">
          <ImportButton
            handleFileChange={handleFileChange}
            handleDownloadTemplate={handleDownloadTemplate}
            isFileSelected={!!file}
            isLoading={isLoading}
            onSubmit={onImport}
          />
        </PermissionGate>
        <PermissionGate permission={['category.create', 'category.edit']}>
          <Sheet open={categoryContext.isModalOpen} onOpenChange={() => !isLoading && categoryContext.toggleModal()}>
            <SheetTrigger asChild>
              <Button
                onClick={() => categoryContext.toggleModal()}
                disabled={isLoading}
              >
                <Plus />
                {t('page.categories.button.create')}
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-xl w-full overflow-y-auto" side="right">
              <SheetHeader>
                <SheetTitle>
                  {t(`page.categories.form.title.${isEdit ? 'edit' : 'create'}`)}
                </SheetTitle>
                <SheetDescription>
                  {t(`page.categories.form.description.${isEdit ? 'edit' : 'create'}`)}
                </SheetDescription>
              </SheetHeader>
              <CategoryForm />
            </SheetContent>
          </Sheet>
        </PermissionGate>
      </div>
    </div>
  )
}
