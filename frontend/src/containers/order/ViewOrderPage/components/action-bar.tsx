import { useTranslation } from 'react-i18next'

export function ActionBar() {
  const { t } = useTranslation()

  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('page.view-order.title')}</h2>
        <p className="text-muted-foreground">{t('page.view-order.description')}</p>
      </div>
    </div>
  )
}
