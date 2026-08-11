import { useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui'
import { useLocale } from '@/utils/hooks'
import { OrderClientSection } from '../../components/OrderClientSection'
import { OrderFilesSection } from '../../components/OrderFilesSection'
import { OrderProductsSection } from '../../components/OrderProductsSection'
import { OrderSidebar } from '../../components/OrderSidebar'
import { useViewOrderContext } from '../context'
import { InformationForm } from './information-form'

export function DataTable() {
  const { t } = useLocale()
  const navigate = useNavigate()
  const { informationForm, isLoading, disabled, payments, files } = useViewOrderContext()
  const items = useWatch({ control: informationForm.control, name: 'items' }) || []
  const clientId = useWatch({ control: informationForm.control, name: 'client' })

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px] lg:items-start">
      <div className="min-w-0 space-y-4">
        <OrderClientSection
          value={clientId || undefined}
          onChange={() => {}}
          disabled={isLoading || disabled}
          titlePrefix="view-order"
        />
        <OrderProductsSection
          products={items}
          addProduct={() => {}}
          removeProduct={() => {}}
          changeProduct={() => {}}
          isLoading={isLoading}
          disabled={disabled}
          titlePrefix="view-order"
          allowAdd={false}
          isProfit
        />
        <InformationForm form={informationForm} onSubmit={() => {}} />
        <OrderFilesSection
          files={files}
          setFiles={() => {}}
          isLoading={isLoading}
          readOnly
          titlePrefix="view-order"
        />
      </div>

      <OrderSidebar
        items={items}
        payments={payments}
        titlePrefix="view-order"
        isLoading={isLoading}
        actions={(
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isLoading}
            loading={isLoading}
            onClick={() => void navigate('/orders')}
          >
            {t('button.back')}
          </Button>
        )}
      />
    </div>
  )
}
