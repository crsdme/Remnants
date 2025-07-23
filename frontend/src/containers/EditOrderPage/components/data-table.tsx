import { useFieldArray } from 'react-hook-form'

import { ProductSelectedTable, ProductTable } from '@/components'
import { Separator } from '@/components/ui'

import { useEditOrderContext } from '@/contexts'

import { useBarcodeScanned } from '@/utils/hooks'
import { ClientForm } from './client-form'
import { InformationForm } from './information-form'
import { PaymentForm } from './payment-form'
import { ProductSelectedTotal } from './product-selected-total'

export function DataTable() {
  const { paymentForm, informationForm, isLoading, clientForm, createClient, editOrder, createPayment, getBarcode } = useEditOrderContext()

  const itemsField = useFieldArray({
    control: informationForm.control,
    name: 'items',
  })

  const onSubmitInformation = (value) => {
    editOrder(value)
  }

  const onSubmitClient = (value) => {
    createClient(value)
  }

  const onSubmitPayment = (value) => {
    createPayment(value)
  }

  const addProduct = (product, selectedQuantity = 1) => {
    const selectedProducts = informationForm.getValues('items')
    const existing = selectedProducts.find(p => p.id === product.id) as any

    if (existing) {
      const index = selectedProducts.findIndex(p => p.id === product.id)
      itemsField.update(index, {
        ...existing,
        quantity: existing.quantity + selectedQuantity,
      })
    }
    else {
      itemsField.append({
        ...product,
        product: product.id,
        quantity: selectedQuantity,
        receivedQuantity: 0,
        selectedPrice: product.price,
        discountAmount: 0,
        discountPercent: 0,
      })
    }
  }

  const removeProduct = (product) => {
    const selectedProducts = informationForm.getValues('items')
    const index = selectedProducts.findIndex(p => p.id === product.id)
    if (index !== -1) {
      itemsField.remove(index)
    }
  }

  const changeQuantity = (product, { quantity, receivedQuantity }: { quantity?: number, receivedQuantity?: number }) => {
    const selectedProducts = informationForm.getValues('items')
    const index = selectedProducts.findIndex(p => p.id === product.id)
    if (index !== -1) {
      itemsField.update(index, {
        ...selectedProducts[index],
        quantity: quantity ?? product.quantity,
        receivedQuantity: receivedQuantity ?? product.receivedQuantity ?? 0,
      })
    }
  }

  const changePrice = (product, { selectedPrice }: { selectedPrice?: number }) => {
    const selectedProducts = informationForm.getValues('items')
    const index = selectedProducts.findIndex(p => p.id === product.id)
    if (index !== -1) {
      itemsField.update(index, { ...selectedProducts[index], selectedPrice })
    }
  }

  const changeDiscount = (product, { discountPercent = 0, discountAmount = 0 }: { discountPercent?: number, discountAmount?: number }) => {
    const selectedProducts = informationForm.getValues('items')
    const index = selectedProducts.findIndex(p => p.id === product.id)
    if (index !== -1) {
      const product = selectedProducts[index]

      let discountPrice = product.price
      if (discountPercent > 0) {
        discountPrice = product.price - (product.price * discountPercent) / 100
      }
      else if (discountAmount > 0) {
        discountPrice = product.price - discountAmount
      }

      itemsField.update(index, {
        ...product,
        discountPercent,
        discountAmount,
        selectedPrice: discountPrice,
      })
    }
  }

  useBarcodeScanned(async (barcode: string) => {
    const products = await getBarcode(barcode)
    for (const product of products) {
      addProduct(product, product.quantity)
    }
  })

  return (
    <>
      <ProductTable addProduct={addProduct} />
      <Separator className="my-4" />
      <ProductSelectedTable
        products={informationForm.getValues('items') || []}
        removeProduct={removeProduct}
        isLoading={isLoading}
        changeQuantity={changeQuantity}
        changePrice={changePrice}
        changeDiscount={changeDiscount}
        isReceiving={false}
        isSelectedPrice={true}
        isDiscount={true}
        includeTotal={true}
      />
      <ProductSelectedTotal />
      <InformationForm form={informationForm} onSubmit={informationForm.handleSubmit(onSubmitInformation)} />
      <PaymentForm form={paymentForm} onSubmit={paymentForm.handleSubmit(onSubmitPayment)} />
      <ClientForm form={clientForm} onSubmit={clientForm.handleSubmit(onSubmitClient)} />
    </>
  )
}
