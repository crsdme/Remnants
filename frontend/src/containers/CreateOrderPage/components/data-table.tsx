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
  const { paymentForm, informationForm, isLoading, clientForm, createClient, createOrder, createPayment, getBarcode } = useCreateOrderContext()

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
        selectedCurrency: product.currency,
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

  // const changeQuantity = (product, { quantity, receivedQuantity }: { quantity?: number, receivedQuantity?: number }) => {
  //   const selectedProducts = informationForm.getValues('items')
  //   const index = selectedProducts.findIndex(p => p.id === product.id)
  //   if (index !== -1) {
  //     itemsField.update(index, {
  //       ...selectedProducts[index],
  //       quantity: quantity ?? product.quantity,
  //       receivedQuantity: receivedQuantity ?? product.receivedQuantity ?? 0,
  //     })
  //   }
  // }

  // const changePrice = (product, { selectedPrice }: { selectedPrice?: number }) => {
  //   const selectedProducts = informationForm.getValues('items')
  //   const index = selectedProducts.findIndex(p => p.id === product.id)
  //   if (index !== -1) {
  //     itemsField.update(index, { ...selectedProducts[index], selectedPrice })
  //   }
  // }

  // const changeDiscount = (product, { discountPercent = 0, discountAmount = 0 }: { discountPercent?: number, discountAmount?: number }) => {
  //   const selectedProducts = informationForm.getValues('items')
  //   const index = selectedProducts.findIndex(p => p.id === product.id)
  //   if (index !== -1) {
  //     const product = selectedProducts[index]

  //     let discountPrice = product.price
  //     if (discountPercent > 0) {
  //       discountPrice = product.price - (product.price * discountPercent) / 100
  //     }
  //     else if (discountAmount > 0) {
  //       discountPrice = product.price - discountAmount
  //     }

  //     itemsField.update(index, {
  //       ...product,
  //       discountPercent,
  //       discountAmount,
  //       selectedPrice: discountPrice,
  //     })
  //   }
  // }

  // const changeCurrency = (product, { selectedCurrency }: { selectedCurrency?: string }) => {
  //   const selectedProducts = informationForm.getValues('items')
  //   const index = selectedProducts.findIndex(p => p.id === product.id)
  //   if (index !== -1) {
  //     itemsField.update(index, { ...selectedProducts[index], selectedCurrency })
  //   }
  // }

  const updateProduct = ({ productId, field, value }: { productId: string, field: string, value: any }) => {
    const selectedProducts = informationForm.getValues('items')
    const index = selectedProducts.findIndex(p => p.id === productId)

    if (index === -1)
      return

    const current = selectedProducts[index]
    const updated = { ...current, [field]: value }

    if (field === 'discountPercent') {
      const discountPercent = value ?? current.discountPercent ?? 0

      if (discountPercent > 0) {
        updated.selectedPrice = current.price - (current.price * discountPercent) / 100
      }
      else {
        updated.selectedPrice = current.price
      }

      updated.discountPercent = discountPercent
      updated.discountAmount = 0
    }

    if (field === 'discountAmount') {
      const discountAmount = value ?? current.discountAmount ?? 0

      if (discountAmount > 0) {
        updated.selectedPrice = current.price - discountAmount
      }
      else {
        updated.selectedPrice = current.price
      }

      updated.discountAmount = discountAmount.toFixed(2)
      updated.discountPercent = 0
    }

    if (field === 'quantity' || field === 'receivedQuantity') {
      updated.quantity = value ?? current.quantity
      updated.receivedQuantity = value ?? current.receivedQuantity ?? 0
    }

    itemsField.update(index, updated)
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
        changeProduct={updateProduct}
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
