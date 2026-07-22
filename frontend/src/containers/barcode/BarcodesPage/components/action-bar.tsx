import { Plus } from 'lucide-react'

import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { PermissionGate } from '@/components'
import { Button } from '@/components/ui'

import { useBarcodeContext } from '../context'

export function ActionBar() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isLoading } = useBarcodeContext()

  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('page.barcodes.title')}</h2>
        <p className="text-muted-foreground">{t('page.barcodes.description')}</p>
      </div>
      <div className="flex items-center flex-wrap gap-2">
        <PermissionGate permission={['barcode.create', 'barcode.edit']}>
          <Button
            onClick={() => void navigate('/barcodes/create')}
            disabled={isLoading}
          >
            <Plus />
            {t('page.barcodes.button.create')}
          </Button>
        </PermissionGate>
      </div>
    </div>
  )
}
