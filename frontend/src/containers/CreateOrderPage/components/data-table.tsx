import { useFieldArray } from 'react-hook-form'

import { ProductSelectedTable, ProductTable } from '@/components'
import { Separator } from '@/components/ui'

import { useCreateOrderContext } from '@/contexts'

import { useBarcodeScanned } from '@/utils/hooks'
import { ClientForm } from './client-form'
import { InformationForm } from './information-form'
import { PaymentForm } from './payment-form'
import { ProductSelectedTotal } from './product-selected-total'

export function DataTable() {
  const { paymentForm, informationForm, isLoading, clientForm, createClient, createOrder, createPayment } = useCreateOrderContext()

  const itemsField = useFieldArray({
    control: informationForm.control,
    name: 'items',
  })

  const onSubmitInformation = (value) => {
    createOrder(value)
  }

  const onSubmitClient = (value) => {
    createClient(value)
  }

  const onSubmitPayment = (value) => {
    createPayment(value)
  }

  const addProduct = (products, selectedQuantity = 1) => {
    const selectedProducts = informationForm.getValues('items')
    products.forEach((product) => {
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
        })
      }
    })
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

  useBarcodeScanned(async (barcode: string) => {
    addProduct([{ id: barcode, name: barcode, price: 0, quantity: 1 }])
    // const data = await getBarcode(barcode)
    // addProduct(data?.[0]?.products || [])
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
        isReceiving={false}
      />
      <ProductSelectedTotal />
      <InformationForm form={informationForm} onSubmit={informationForm.handleSubmit(onSubmitInformation)} />
      <PaymentForm form={paymentForm} onSubmit={paymentForm.handleSubmit(onSubmitPayment)} />
      <ClientForm form={clientForm} onSubmit={clientForm.handleSubmit(onSubmitClient)} />
    </>
  )
}
