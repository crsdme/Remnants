import { Plus } from 'lucide-react'

import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { PermissionGate } from '@/components'
import { Button } from '@/components/ui'

import { useWarehouseTransactionContext } from '../context'

export function ActionBar() {
  const { t } = useTranslation()
  const { isLoading } = useWarehouseTransactionContext()
  const navigate = useNavigate()

  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('page.warehouse-transactions.title')}</h2>
        <p className="text-muted-foreground">{t('page.warehouse-transactions.description')}</p>
      </div>
      <div className="flex items-center flex-wrap gap-2">
        <PermissionGate permission={['warehouse-transaction.create', 'warehouse-transaction.edit']}>
          <Button
            onClick={() => void navigate('/warehouse-transactions/create')}
            disabled={isLoading}
          >
            <Plus />
            {t('page.warehouse-transactions.button.create')}
          </Button>
        </PermissionGate>
      </div>
    </div>
  )
}
