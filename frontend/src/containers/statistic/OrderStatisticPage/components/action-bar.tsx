import { Button } from '@/components/ui'
import { Download } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function ActionBar() {
  const { t } = useTranslation()

  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('page.order-statistic.title')}</h2>
        <p className="text-muted-foreground">{t('page.order-statistic.description')}</p>
      </div>
      <div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4" />
          {t('table.export')}
        </Button>
      </div>
    </div>
  )
}
