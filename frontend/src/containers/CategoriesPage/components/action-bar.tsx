import { Plus } from 'lucide-react'

import { useTranslation } from 'react-i18next'
import { PermissionGate } from '@/components'
import { Button, Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui'
import { useCategoryContext } from '../context'

import { CategoryForm } from './form'

export function ActionBar() {
  const { t } = useTranslation()
  const categoryContext = useCategoryContext()

  const { isLoading, isEdit } = categoryContext

  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('page.categories.title')}</h2>
        <p className="text-muted-foreground">{t('page.categories.description')}</p>
      </div>
      <div className="flex items-center flex-wrap gap-2">
        <PermissionGate permission={['category.create', 'category.edit']}>
          <Sheet open={categoryContext.isModalOpen} onOpenChange={categoryContext.closeModal}>
            <SheetTrigger asChild>
              <Button
                onClick={() => categoryContext.openModal()}
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
              <div className="w-full px-4">
                <CategoryForm />
              </div>
            </SheetContent>
          </Sheet>
        </PermissionGate>
      </div>
    </div>
  )
}
