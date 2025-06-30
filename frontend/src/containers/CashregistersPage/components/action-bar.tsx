import { Plus } from 'lucide-react'

import { useTranslation } from 'react-i18next'
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
import { useCashregisterContext } from '@/contexts'

import { CashregisterForm } from './form'

export function ActionBar() {
  const { t } = useTranslation()
  const { isModalOpen, isLoading, isEdit, openModal, closeModal } = useCashregisterContext()

  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('page.cashregisters.title')}</h2>
        <p className="text-muted-foreground">{t('page.cashregisters.description')}</p>
      </div>
      <div className="flex items-center flex-wrap gap-2">
        <PermissionGate permission={['cashregister.create']}>
          <Sheet open={isModalOpen} onOpenChange={() => closeModal()}>
            <SheetTrigger asChild>
              <Button onClick={() => openModal()} disabled={isLoading}>
                <Plus />
                {t('page.cashregisters.button.create')}
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-xl w-full overflow-y-auto" side="right">
              <SheetHeader>
                <SheetTitle>{t(`page.cashregisters.form.title.${isEdit ? 'edit' : 'create'}`)}</SheetTitle>
                <SheetDescription>
                  {t(`page.cashregisters.form.description.${isEdit ? 'edit' : 'create'}`)}
                </SheetDescription>
              </SheetHeader>
              <div className="w-full pb-4 px-4">
                <CashregisterForm />
              </div>
            </SheetContent>
          </Sheet>
        </PermissionGate>
      </div>
    </div>
  )
}
