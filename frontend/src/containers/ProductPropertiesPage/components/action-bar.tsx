import { Plus } from 'lucide-react'

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
import { useLocale } from '@/utils/hooks'
import { useProductPropertiesContext } from '../context'
import { ProductOptionForm, ProductPropertyForm } from './form'

export function ActionBar() {
  const { t } = useLocale()
  const { permissions } = useAuthContext()

  const {
    isLoading,
    isPropertyModalOpen,
    isPropertyEdit,
    isOptionModalOpen,
    isOptionsEdit,
    openPropertyModal,
    closePropertyModal,
    closeOptionsModal,
  } = useProductPropertiesContext()

  const canCreateProperty = hasPermission(permissions, 'productProperty.create')
  const canEditProperty = hasPermission(permissions, 'productProperty.edit')
  const canOpenPropertyForm = canCreateProperty || canEditProperty

  const canCreateOption = hasPermission(permissions, 'productPropertyOption.create')
  const canEditOption = hasPermission(permissions, 'productPropertyOption.edit')
  const canOpenOptionForm = canCreateOption || canEditOption

  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('page.product-properties.title')}</h2>
        <p className="text-muted-foreground">{t('page.product-properties.description')}</p>
      </div>
      <div className="flex items-center flex-wrap gap-2">

        {canOpenOptionForm && (
          <Sheet open={isOptionModalOpen} onOpenChange={() => closeOptionsModal()}>
            <SheetContent className="sm:max-w-xl w-full overflow-y-auto" side="right">
              <SheetHeader>
                <SheetTitle>{t(`page.product-properties.form.title.${isOptionsEdit ? 'edit' : 'create'}`)}</SheetTitle>
                <SheetDescription>
                  {t(`page.product-properties.form.description.${isOptionsEdit ? 'edit' : 'create'}`)}
                </SheetDescription>
              </SheetHeader>
              <div className="w-full pb-4 px-4">
                <ProductOptionForm />
              </div>
            </SheetContent>
          </Sheet>
        )}

        {canOpenPropertyForm && (
          <Sheet open={isPropertyModalOpen} onOpenChange={() => closePropertyModal()}>
            {canCreateProperty && (
              <SheetTrigger asChild>
                <Button onClick={() => openPropertyModal()} disabled={isLoading}>
                  <Plus />
                  {t('page.product-properties.button.create')}
                </Button>
              </SheetTrigger>
            )}
            <SheetContent className="sm:max-w-xl w-full overflow-y-auto" side="right">
              <SheetHeader>
                <SheetTitle>{t(`page.product-properties.form.title.${isPropertyEdit ? 'edit' : 'create'}`)}</SheetTitle>
                <SheetDescription>
                  {t(`page.product-properties.form.description.${isPropertyEdit ? 'edit' : 'create'}`)}
                </SheetDescription>
              </SheetHeader>
              <div className="w-full pb-4 px-4">
                <ProductPropertyForm />
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </div>
  )
}
