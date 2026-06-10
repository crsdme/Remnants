import { useTranslation } from 'react-i18next'

import { useViewOrderContext } from '../context'

export function ActionBar() {
  const { t } = useTranslation()
  const { order } = useViewOrderContext()

  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {order?.seq != null ? `${t('page.view-order.title')} #${order.seq}` : t('page.view-order.title')}
        </h2>
        <p className="text-muted-foreground">{t('page.view-order.description')}</p>
      </div>
    </div>
  )
}
