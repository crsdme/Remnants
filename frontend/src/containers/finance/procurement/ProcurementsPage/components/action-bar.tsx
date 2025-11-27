import { Plus } from 'lucide-react'

import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { PermissionGate } from '@/components'
import { Button } from '@/components/ui'

import { useProcurementContext } from '../context'

export function ActionBar() {
  const { t } = useTranslation()
  const { isLoading } = useProcurementContext()
  const navigate = useNavigate()

  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('page.procurements.title')}</h2>
        <p className="text-muted-foreground">{t('page.procurements.description')}</p>
      </div>
      <div className="flex items-center flex-wrap gap-2">
        <PermissionGate permission={['procurement.create', 'procurement.edit']}>
          <Button
            onClick={() => navigate('/procurements/create')}
            disabled={isLoading}
          >
            <Plus />
            {t('page.procurements.button.create')}
          </Button>
          {/* <Dialog open={isModalOpen} onOpenChange={closeModal}>
            <DialogTrigger asChild>
              <Button
                onClick={async () => await openModal()}
                disabled={isLoading}
              >
                <Plus />
                {t('page.procurements.button.create')}
              </Button>
            </DialogTrigger>
            <DialogContent className="flex flex-col min-w-[98vw] max-w-[98vw] max-h-[98vh] overflow-y-auto sm:max-w-[85vw] sm:min-w-[85vw]">
              <DialogHeader>
                <DialogTitle>
                  {t(`page.procurements.form.title.${isEdit ? 'edit' : 'create'}`)}
                </DialogTitle>
                <DialogDescription>
                  {t(`page.procurements.form.description.${isEdit ? 'edit' : 'create'}`)}
                </DialogDescription>
              </DialogHeader>
              <div className="w-full">
                <ProcurementForm />
              </div>
            </DialogContent>
          </Dialog> */}
        </PermissionGate>
      </div>
    </div>
  )
}
