import { Plus } from 'lucide-react'

import { useTranslation } from 'react-i18next'

import { useRequestLanguages } from '@/api/hooks'
import { PermissionGate } from '@/components'
import {
  Button,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui'
import { useProductPropertiesContext } from '@/contexts'

import { ProductOptionForm, ProductPropertyForm } from './form'

export function ActionBar() {
  const { t } = useTranslation()

  const {
    isLoading,
    isPropertyModalOpen,
    isPropertyEdit,
    isOptionModalOpen,
    isOptionsEdit,
    selectedProperty,
    openPropertyModal,
    closePropertyModal,
    closeOptionsModal,
    optionForm,
    propertyForm,
    submitOptionsForm,
    submitProductPropertyForm,
  } = useProductPropertiesContext()

  const requestLanguages = useRequestLanguages({ pagination: { full: true } })
  const languages = requestLanguages?.data?.data?.languages || []

  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('page.product-properties.title')}</h2>
        <p className="text-muted-foreground">{t('page.product-properties.description')}</p>
      </div>
      <div className="flex items-center flex-wrap gap-2">

        <PermissionGate permission={['product-properties-options.create']}>
          <Sheet open={isOptionModalOpen} onOpenChange={() => closeOptionsModal()}>
            <SheetContent className="sm:max-w-xl w-full overflow-y-auto" side="right">
              <SheetHeader>
                <SheetTitle>{t(`page.product-properties.form.title.${isOptionsEdit ? 'edit' : 'create'}`)}</SheetTitle>
                <SheetDescription>
                  {t(`page.product-properties.form.description.${isOptionsEdit ? 'edit' : 'create'}`)}
                </SheetDescription>
              </SheetHeader>
              <div className="w-full pb-4 px-4">
                <ProductOptionForm
                  form={optionForm}
                  languages={languages}
                  isLoading={isLoading}
                  onSubmit={submitOptionsForm}
                  closeModal={closeOptionsModal}
                  selectedProperty={selectedProperty}
                />
              </div>
            </SheetContent>
          </Sheet>
        </PermissionGate>

        <PermissionGate permission={['product-properties.create']}>
          <Sheet open={isPropertyModalOpen} onOpenChange={() => closePropertyModal()}>
            <SheetTrigger asChild>
              <Button onClick={() => openPropertyModal()} disabled={isLoading}>
                <Plus />
                {t('page.product-properties.button.create')}
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-xl w-full overflow-y-auto" side="right">
              <SheetHeader>
                <SheetTitle>{t(`page.product-properties.form.title.${isPropertyEdit ? 'edit' : 'create'}`)}</SheetTitle>
                <SheetDescription>
                  {t(`page.product-properties.form.description.${isPropertyEdit ? 'edit' : 'create'}`)}
                </SheetDescription>
              </SheetHeader>
              <div className="w-full pb-4 px-4">
                <ProductPropertyForm
                  form={propertyForm}
                  languages={languages}
                  isLoading={isLoading}
                  onSubmit={submitProductPropertyForm}
                  closeModal={closePropertyModal}
                />
              </div>
            </SheetContent>
          </Sheet>
        </PermissionGate>
      </div>
    </div>
  )
}
