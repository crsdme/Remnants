import { Plus } from 'lucide-react'

import { useTranslation } from 'react-i18next'
import { PermissionGate } from '@/components'
import { Button, Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui'
import { useWarehouseContext } from '@/contexts'

import { WarehouseForm } from './form'

export function ActionBar() {
  const { t } = useTranslation()
  const warehouseContext = useWarehouseContext()

  const { isLoading, isEdit } = warehouseContext

  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('page.warehouses.title')}</h2>
        <p className="text-muted-foreground">{t('page.warehouses.description')}</p>
      </div>
      <div className="flex items-center flex-wrap gap-2">
        <PermissionGate permission={['warehouse.create', 'warehouse.edit']}>
          <Sheet open={warehouseContext.isModalOpen} onOpenChange={warehouseContext.closeModal}>
            <SheetTrigger asChild>
              <Button
                onClick={() => warehouseContext.openModal()}
                disabled={isLoading}
              >
                <Plus />
                {t('page.warehouses.button.create')}
              </Button>
            </SheetTrigger>
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
        </PermissionGate>
      </div>
    </div>
  )
}
