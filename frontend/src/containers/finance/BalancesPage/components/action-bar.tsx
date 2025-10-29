import { Download, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PermissionGate } from '@/components/PermissionGate'
import { Button, Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui'
import { useBalanceContext } from '../context'
import { BalanceForm } from './form'

export function ActionBar() {
  const { t } = useTranslation()
  const { isModalOpen, isLoading, openModal, closeModal } = useBalanceContext()

  return (
    <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('page.balances.title')}</h2>
        <p className="text-muted-foreground">{t('page.balances.description')}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline">
          <Download className="h-4 w-4" />
          {t('table.export')}
        </Button>
        <div className="flex items-center flex-wrap gap-2">
          <PermissionGate permission={['balance.create']}>
            <Sheet open={isModalOpen} onOpenChange={() => closeModal()}>
              <SheetTrigger asChild>
                <Button onClick={() => openModal()} disabled={isLoading}>
                  <Plus />
                  {t('page.balances.button.create')}
                </Button>
              </SheetTrigger>
              <SheetContent className="sm:max-w-xl w-full overflow-y-auto" side="right">
                <SheetHeader>
                  <SheetTitle>{t(`page.balances.form.title.create`)}</SheetTitle>
                  <SheetDescription>
                    {t(`page.balances.form.description.create`)}
                  </SheetDescription>
                </SheetHeader>
                <div className="w-full pb-4 px-4">
                  <BalanceForm />
                </div>
              </SheetContent>
            </Sheet>
          </PermissionGate>
        </div>
      </div>
    </div>
  )
}
