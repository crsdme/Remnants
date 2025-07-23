import { useFieldArray } from 'react-hook-form'

import { ProductSelectedTable, ProductTable } from '@/components'

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
        changeQuantity={() => {}}
        isReceiving={false}
        isSelectedPrice={true}
        isDiscount={true}
        includeTotal={true}
        changePrice={() => {}}
        changeDiscount={() => {}}
      />
      <ProductSelectedTotal />
      <InformationForm form={informationForm} onSubmit={() => {}} />
    </>
  )
}
