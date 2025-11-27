import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui'

export function ActionBar() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap- mb-4">
        <Button variant="ghost" onClick={() => navigate('/procurements')}>
          <ArrowLeft className="h-4 w-4" />
          {t('button.back')}
        </Button>
      </div>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('page.procurements.create.title')}</h2>
          <p className="text-muted-foreground">{t('page.procurements.create.description')}</p>
        </div>
      </div>
    </>
  )
}
