import { Plus } from 'lucide-react'

import { useTranslation } from 'react-i18next'
import { PermissionGate } from '@/components'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,

} from '@/components/ui'
import { useAutomationContext } from '@/contexts'

import { AutomationActionsForm, AutomationConditionsForm, AutomationForm } from './form'

export function ActionBar() {
  const { t } = useTranslation()
  const {
    isModalOpen,
    isConditionSheetOpen,
    isActionSheetOpen,
    isLoading,
    isEdit,
    openModal,
    closeModal,
    closeConditionSheet,
    closeActionSheet,
  } = useAutomationContext()

  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('page.automations.title')}</h2>
        <p className="text-muted-foreground">{t('page.automations.description')}</p>
      </div>
      <div className="flex items-center flex-wrap gap-2">
        <PermissionGate permission={['automation.create']}>
          <Dialog open={isModalOpen} onOpenChange={() => closeModal()}>
            <DialogTrigger asChild>
              <Button onClick={() => openModal()} disabled={isLoading}>
                <Plus />
                {t('page.automations.button.create')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl w-full overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t(`page.automations.form.title.${isEdit ? 'edit' : 'create'}`)}</DialogTitle>
                <DialogDescription>
                  {t(`page.automations.form.description.${isEdit ? 'edit' : 'create'}`)}
                </DialogDescription>
              </DialogHeader>
              <AutomationForm />
            </DialogContent>
          </Dialog>
          <Sheet open={isConditionSheetOpen} onOpenChange={() => closeConditionSheet()}>
            <SheetContent className="sm:max-w-xl w-full overflow-y-auto">
              <SheetHeader>
                <SheetTitle>{t(`page.automations.form.title.condition`)}</SheetTitle>
                <SheetDescription>
                  {t(`page.automations.form.description.condition`)}
                </SheetDescription>
              </SheetHeader>
              <div className="w-full pb-4 px-4">
                <AutomationConditionsForm />
              </div>
            </SheetContent>
          </Sheet>
          <Sheet open={isActionSheetOpen} onOpenChange={() => closeActionSheet()}>
            <SheetContent className="sm:max-w-xl w-full overflow-y-auto">
              <SheetHeader>
                <SheetTitle>{t(`page.automations.form.title.action`)}</SheetTitle>
                <SheetDescription>
                  {t(`page.automations.form.description.action`)}
                </SheetDescription>
              </SheetHeader>
              <div className="w-full pb-4 px-4">
                <AutomationActionsForm />
              </div>
            </SheetContent>
          </Sheet>
        </PermissionGate>
      </div>
    </div>
  )
}
