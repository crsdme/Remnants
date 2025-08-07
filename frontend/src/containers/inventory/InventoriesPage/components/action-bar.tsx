import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { PermissionGate } from '@/components'
import { Button } from '@/components/ui'

export function ActionBar() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('page.inventories.title')}</h2>
        <p className="text-muted-foreground">{t('page.inventories.description')}</p>
      </div>
      <div className="flex items-center flex-wrap gap-2">
        <PermissionGate permission={['inventory.create', 'inventory.edit']}>
          <Button
            onClick={() => navigate('/inventories/create')}
          >
            <Plus />
            {t('page.inventories.button.create')}
          </Button>
        </PermissionGate>
      </div>
    </div>
  )
}
