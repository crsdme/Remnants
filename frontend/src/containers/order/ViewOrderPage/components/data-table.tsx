import { ProductSelectedTable } from '@/components'

import { useViewOrderContext } from '../context'
import { InformationForm } from './information-form'

export function DataTable() {
  const { informationForm, isLoading, disabled } = useViewOrderContext()
  const items = informationForm.watch('items') || []

  return (
    <>
      <ProductSelectedTable
        products={items}
        removeProduct={() => {}}
        disabled={disabled}
        isLoading={isLoading}
        isReceiving={false}
        isSelectedPrice={true}
        isDiscount={true}
        isQuantity={true}
        includeTotal={true}
        changeProduct={() => {}}
        isProfit={true}
      />
      <InformationForm form={informationForm} onSubmit={() => {}} />
    </>
  )
}
