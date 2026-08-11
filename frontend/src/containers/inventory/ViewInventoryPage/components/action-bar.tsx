import { useNavigate } from 'react-router-dom'
import { PermissionGate } from '@/components'
import { Button } from '@/components/ui'
import { useLocale } from '@/utils/hooks'
import { useViewInventoryContext } from '../context'

export function ActionBar() {
  const { t } = useLocale()
  const navigate = useNavigate()
  const { inventory, isLoading } = useViewInventoryContext()
  const isDraft = inventory?.status === 'draft'

  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {inventory?.seq != null
            ? t('page.view-inventory.title-with-seq', { seq: inventory.seq })
            : t('page.view-inventory.title')}
        </h2>
        <p className="text-muted-foreground">{t('page.view-inventory.description')}</p>
      </div>
      {isDraft && inventory?.seq != null && (
        <PermissionGate permission={['inventory.edit', 'inventory.create']}>
          <Button
            disabled={isLoading}
            onClick={() => void navigate(`/inventories/edit/${inventory.seq}`)}
          >
            {t('page.view-inventory.button.continue')}
          </Button>
        </PermissionGate>
      )}
    </div>
  )
}
