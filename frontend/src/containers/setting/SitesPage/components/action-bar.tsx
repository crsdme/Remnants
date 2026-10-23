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
import { useSiteContext } from '../context'

import { SiteForm } from './form'

export function ActionBar() {
  const { t } = useLocale()
  const { isModalOpen, isLoading, isEdit, openModal, closeModal } = useSiteContext()
  const { permissions } = useAuthContext()
  const canCreate = hasPermission(permissions, 'site.create')
  const canOpenForm = canCreate || hasPermission(permissions, 'site.edit')

  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('page.sites.title')}</h2>
        <p className="text-muted-foreground">{t('page.sites.description')}</p>
      </div>
      <div className="flex items-center flex-wrap gap-2">
        {canOpenForm && (
          <Sheet open={isModalOpen} onOpenChange={() => closeModal()}>
            {canCreate && (
              <SheetTrigger asChild>
                <Button onClick={() => openModal()} disabled={isLoading}>
                  <Plus />
                  {t('page.sites.button.create')}
                </Button>
              </SheetTrigger>
            )}
            <SheetContent className="sm:max-w-xl w-full overflow-y-auto" side="right">
              <SheetHeader>
                <SheetTitle>{t(`page.sites.form.title.${isEdit ? 'edit' : 'create'}`)}</SheetTitle>
                <SheetDescription>
                  {t(`page.sites.form.description.${isEdit ? 'edit' : 'create'}`)}
                </SheetDescription>
              </SheetHeader>
              <div className="w-full pb-4 px-4">
                <SiteForm />
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </div>
  )
}
