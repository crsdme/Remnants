import { ProductSelectedTable } from '@/components'

import { useViewOrderContext } from '@/contexts'
import { InformationForm } from './information-form'
import { ProductSelectedTotal } from './product-selected-total'

export function DataTable() {
  const { informationForm } = useViewOrderContext()

  return (
    <>
      <ProductSelectedTable
        products={informationForm.getValues('items') || []}
        removeProduct={() => {}}
        disabled={true}
        isReceiving={false}
        isSelectedPrice={true}
        isDiscount={true}
        includeTotal={true}
        changeProduct={() => {}}
      />
      <ProductSelectedTotal />
      <InformationForm form={informationForm} onSubmit={() => {}} />
    </>
  )
}
