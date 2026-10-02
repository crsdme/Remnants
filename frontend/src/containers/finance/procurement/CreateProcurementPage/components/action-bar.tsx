import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui'
import { useCreateProcurementContext } from '../context'

export function ActionBar() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isEdit } = useCreateProcurementContext()

  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap- mb-4">
        <Button variant="ghost" onClick={() => void navigate('/procurements')}>
          <ArrowLeft className="h-4 w-4" />
          {t('button.back')}
        </Button>
      </div>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {t(isEdit ? 'page.procurements.form.title.edit' : 'page.procurements.create.title')}
          </h2>
          <p className="text-muted-foreground">
            {t(isEdit ? 'page.procurements.form.description.edit' : 'page.procurements.create.description')}
          </p>
        </div>
      </div>
    </>
  )
}
