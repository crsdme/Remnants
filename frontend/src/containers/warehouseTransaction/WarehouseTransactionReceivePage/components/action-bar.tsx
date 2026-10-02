import { Helmet } from 'react-helmet'
import { useNavigate } from 'react-router-dom'
import { PermissionGate } from '@/components'
import { Button } from '@/components/ui'
import { useLocale } from '@/utils/hooks'
import { useWarehouseTransactionContext } from '../context'

export function ActionBar() {
  const { t } = useLocale()
  const navigate = useNavigate()
  const { isViewMode, warehouseTransaction } = useWarehouseTransactionContext()
  const titleKey = isViewMode
    ? 'page.warehouse-transaction-view.title'
    : 'page.warehouse-transaction-receive.title'
  const descriptionKey = isViewMode
    ? 'page.warehouse-transaction-view.description'
    : 'page.warehouse-transaction-receive.description'
  const seoTitleKey = isViewMode
    ? 'title.page.warehouse-transaction-view'
    : 'title.page.warehouse-transaction-receive'
  const seoDescriptionKey = isViewMode
    ? 'description.page.warehouse-transaction-view'
    : 'description.page.warehouse-transaction-receive'

  return (
    <>
      <Helmet>
        <title>{t(seoTitleKey)}</title>
        <meta name="description" content={t(seoDescriptionKey)} />
      </Helmet>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t(titleKey)}</h2>
          <p className="text-muted-foreground">{t(descriptionKey)}</p>
        </div>
        {isViewMode && warehouseTransaction?.status === 'awaiting' && warehouseTransaction.seq != null && (
          <PermissionGate permission="warehouseTransaction.receive">
            <Button onClick={() => void navigate(`/warehouse-transactions/receive/${warehouseTransaction.seq}`)}>
              {t('table.receive')}
            </Button>
          </PermissionGate>
        )}
      </div>
    </>
  )
}
