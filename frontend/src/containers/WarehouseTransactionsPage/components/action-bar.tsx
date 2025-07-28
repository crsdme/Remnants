import { Plus } from 'lucide-react'

import { useTranslation } from 'react-i18next'
import { PermissionGate } from '@/components'
import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui'
import { useWarehouseTransactionContext } from '@/contexts'

import { WarehouseTransactionForm } from './form'

export function ActionBar() {
  const { t } = useTranslation()
  const { isLoading, isEdit, isModalOpen, closeModal, openModal } = useWarehouseTransactionContext()

  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('page.warehouse-transactions.title')}</h2>
        <p className="text-muted-foreground">{t('page.warehouse-transactions.description')}</p>
      </div>
      <div className="flex items-center flex-wrap gap-2">
        <PermissionGate permission={['warehouse-transaction.create', 'warehouse-transaction.edit']}>
          <Dialog open={isModalOpen} onOpenChange={closeModal}>
            <DialogTrigger asChild>
              <Button
                onClick={async () => await openModal()}
                disabled={isLoading}
              >
                <Plus />
                {t('page.warehouse-transactions.button.create')}
              </Button>
            </DialogTrigger>
            <DialogContent className="flex flex-col min-w-[98vw] max-w-[98vw] max-h-[98vh] overflow-y-auto sm:max-w-[85vw] sm:min-w-[85vw]">
              <DialogHeader>
                <DialogTitle>
                  {t(`page.warehouse-transactions.form.title.${isEdit ? 'edit' : 'create'}`)}
                </DialogTitle>
                <DialogDescription>
                  {t(`page.warehouse-transactions.form.description.${isEdit ? 'edit' : 'create'}`)}
                </DialogDescription>
              </DialogHeader>
              <div className="w-full">
                <WarehouseTransactionForm />
              </div>
            </DialogContent>
          </Dialog>
        </PermissionGate>
      </div>
    </div>
  )
}
