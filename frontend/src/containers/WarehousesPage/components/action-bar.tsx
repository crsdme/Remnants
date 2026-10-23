import { Plus } from 'lucide-react'

import { useTranslation } from 'react-i18next'
import { Button, Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui'
import { useAuthContext } from '@/contexts'
import { hasPermission } from '@/utils/helpers/permission'
import { useWarehouseContext } from '../context'

import { WarehouseForm } from './form'

export function ActionBar() {
  const { t } = useTranslation()
  const { isModalOpen, isLoading, openModal, isEdit, closeModal } = useWarehouseContext()
  const { permissions } = useAuthContext()
  const canCreate = hasPermission(permissions, 'warehouse.create')
  const canOpenForm = canCreate || hasPermission(permissions, 'warehouse.edit')

  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('page.warehouses.title')}</h2>
        <p className="text-muted-foreground">{t('page.warehouses.description')}</p>
      </div>
      <div className="flex items-center flex-wrap gap-2">
        {canOpenForm && (
          <Sheet open={isModalOpen} onOpenChange={() => closeModal()}>
            {canCreate && (
              <SheetTrigger asChild>
                <Button
                  onClick={() => openModal()}
                  disabled={isLoading}
                >
                  <Plus />
                  {t('page.warehouses.button.create')}
                </Button>
              </SheetTrigger>
            )}
            <SheetContent className="sm:max-w-xl w-full overflow-y-auto" side="right">
              <SheetHeader>
                <SheetTitle>
                  {t(`page.warehouses.form.title.${isEdit ? 'edit' : 'create'}`)}
                </SheetTitle>
                <SheetDescription>
                  {t(`page.warehouses.form.description.${isEdit ? 'edit' : 'create'}`)}
                </SheetDescription>
              </SheetHeader>
              <div className="w-full px-4">
                <WarehouseForm />
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </div>
  )
}
