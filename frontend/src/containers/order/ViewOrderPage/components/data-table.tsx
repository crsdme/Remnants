import { ProductSelectedTable } from '@/components'

import { useViewOrderContext } from '../context'
import { InformationForm } from './information-form'

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
        isProfit={true}
      />
      <InformationForm form={informationForm} onSubmit={() => {}} />
    </>
  )
}
