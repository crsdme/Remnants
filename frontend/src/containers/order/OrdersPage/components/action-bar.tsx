import { Plus } from 'lucide-react'

import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { PermissionGate } from '@/components'
import {
  Button,
} from '@/components/ui'
import { useOrderContext } from '@/contexts'

export function ActionBar() {
  const { t } = useTranslation()
  const { isLoading } = useOrderContext()
  const navigate = useNavigate()

  const createOrder = () => {
    navigate('/orders/create')
  }

  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('page.orders.title')}</h2>
        <p className="text-muted-foreground">{t('page.orders.description')}</p>
      </div>
      <div className="flex items-center flex-wrap gap-2">
        <PermissionGate permission={['order.create']}>
          <Button onClick={createOrder} disabled={isLoading}>
            <Plus />
            {t('page.orders.button.create')}
          </Button>
        </PermissionGate>
      </div>
    </div>
  )
}
