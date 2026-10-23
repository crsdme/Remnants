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
import { useUserContext } from '../context'

import { UserForm } from './form'

export function ActionBar() {
  const { t } = useLocale()
  const { isModalOpen, isLoading, openModal, isEdit, closeModal } = useUserContext()
  const { permissions } = useAuthContext()
  const canCreate = hasPermission(permissions, 'user.create')
  const canOpenForm = canCreate || hasPermission(permissions, 'user.edit')

  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('page.users.title')}</h2>
        <p className="text-muted-foreground">{t('page.users.description')}</p>
      </div>
      <div className="flex items-center flex-wrap gap-2">
        {canOpenForm && (
          <Sheet open={isModalOpen} onOpenChange={() => closeModal()}>
            {canCreate && (
              <SheetTrigger asChild>
                <Button onClick={() => openModal()} disabled={isLoading}>
                  <Plus />
                  {t('page.users.button.create')}
                </Button>
              </SheetTrigger>
            )}
            <SheetContent className="sm:max-w-xl w-full max-w-full overflow-y-auto overflow-x-hidden" side="right">
              <SheetHeader>
                <SheetTitle>{t(`page.users.form.title.${isEdit ? 'edit' : 'create'}`)}</SheetTitle>
                <SheetDescription>
                  {t(`page.users.form.description.${isEdit ? 'edit' : 'create'}`)}
                </SheetDescription>
              </SheetHeader>
              <div className="w-full min-w-0 max-w-full pb-4 px-4">
                <UserForm />
              </div>
            </SheetContent>
          </Sheet>
        )}

      </div>
    </div>
  )
}
