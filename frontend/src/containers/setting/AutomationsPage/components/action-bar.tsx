import { Plus } from 'lucide-react'

import { PermissionGate } from '@/components'
import {
  Button,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui'
import { useLocale } from '@/utils/hooks'
import { useAutomationContext } from '../context'

import { AutomationForm } from './form'

export function ActionBar() {
  const { t } = useLocale()
  const {
    isModalOpen,
    isLoading,
    isEdit,
    openModal,
    closeModal,
  } = useAutomationContext()

  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('page.automations.title')}</h2>
        <p className="text-muted-foreground">{t('page.automations.description')}</p>
      </div>
      <div className="flex items-center flex-wrap gap-2">
        <PermissionGate permission={['automation.create', 'automation.edit']}>
          <Button onClick={() => openModal()} disabled={isLoading}>
            <Plus />
            {t('page.automations.button.create')}
          </Button>
        </PermissionGate>
        <Sheet
          open={isModalOpen}
          onOpenChange={(open) => {
            if (!open)
              closeModal()
          }}
        >
          <SheetContent className="w-full overflow-y-auto sm:max-w-lg" side="right">
            <SheetHeader className="border-b pb-4">
              <SheetTitle>{t(`page.automations.form.title.${isEdit ? 'edit' : 'create'}`)}</SheetTitle>
              <SheetDescription>
                {t(`page.automations.form.description.${isEdit ? 'edit' : 'create'}`)}
              </SheetDescription>
            </SheetHeader>
            <div className="w-full px-4 pt-2 pb-4">
              <AutomationForm />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
