import type { ProductPopulatedDTO } from '@remnant/shared'

import type { OrderLineItemFormValues } from '../context'

import { useFieldArray, useWatch } from 'react-hook-form'
import { roundNumber } from '@/utils/helpers'
import { useBarcodeScanned, useLocale } from '@/utils/hooks'
import { OrderClientSection } from '../../components/OrderClientSection'
import { OrderFilesSection } from '../../components/OrderFilesSection'
import { OrderProductsSection } from '../../components/OrderProductsSection'
import { OrderSidebar, OrderSidebarSubmitButton } from '../../components/OrderSidebar'
import { useEditOrderContext } from '../context'
import { ClientForm } from './client-form'
import { InformationForm } from './information-form'
import { PaymentForm } from './payment-form'

export function DataTable() {
  const { t } = useLocale()
  const {
    paymentForm,
    informationForm,
    isLoading,
    clientForm,
    createClient,
    editOrder,
    createPayment,
    getBarcode,
    payments,
    files,
    setFiles,
    openPaymentModal,
    removePayment,
    openClientModal,
  } = useEditOrderContext()

  const items = useWatch({ control: informationForm.control, name: 'items' }) || []
  const clientId = useWatch({ control: informationForm.control, name: 'client' })

  const itemsField = useFieldArray({
    control: informationForm.control,
    name: 'items',
  })

  const onSubmitInformation = (value: any) => {
    editOrder(value)
  }

  const onSubmitClient = (value: any) => {
    createClient(value)
  }

  const onSubmitPayment = (value: any) => {
    createPayment(value)
  }

  const addProduct = (product: ProductPopulatedDTO, selectedQuantity = 1) => {
    const selectedProducts = informationForm.getValues('items')
    const existingProduct = selectedProducts.find(item => item.product === product.id)

    if (existingProduct) {
      const existingProductIndex = selectedProducts.findIndex(item => item.product === product.id)
      itemsField.update(existingProductIndex, {
        ...existingProduct,
        lineQuantity: existingProduct.lineQuantity + selectedQuantity,
      })
    }
    else {
      itemsField.append({
        ...product,
        product: product.id,
        lineQuantity: selectedQuantity,
        receivedQuantity: 0,
        selectedPrice: product.price,
        price: product.price,
        manualPrice: undefined,
        basePrice: product.price,
        selectedCurrencyId: product.currency.id,
        discountAmount: 0,
        discountPercent: 0,
      })
    }
  }

  const removeProduct = (productId: string) => {
    const selectedProducts = informationForm.getValues('items')
    const index = selectedProducts.findIndex(item => item.id === productId)
    if (index !== -1) {
      itemsField.remove(index)
    }
  }

  const updateProduct = <Key extends keyof OrderLineItemFormValues>({ productId, field, value }: { productId: string, field: Key, value: OrderLineItemFormValues[Key] }) => {
    const selectedProducts = informationForm.getValues('items')
    const index = selectedProducts.findIndex(item => item.id === productId)

    if (index === -1)
      return

    const current = selectedProducts[index]
    const updated: OrderLineItemFormValues = { ...current }

    updated[field] = value
    if (field === 'lineQuantity' || field === 'receivedQuantity') {
      updated.lineQuantity = value ?? current.lineQuantity ?? 0
      updated.receivedQuantity = value ?? current.receivedQuantity ?? 0
    }

    if (field === 'selectedPrice') {
      if (current.price === value)
        return

      updated.manualPrice = value
    }

    if (field === 'discountPercent') {
      const discountPercent = value ?? current.discountPercent ?? 0
      updated.discountPercent = roundNumber(discountPercent)
      updated.discountAmount = 0
    }

    if (field === 'discountAmount') {
      const discountAmount = value ?? current.discountAmount ?? 0
      updated.discountAmount = roundNumber(discountAmount)
      updated.discountPercent = 0
    }

    if (['selectedPrice', 'discountPercent', 'discountAmount'].includes(field)) {
      const currentPrice = (updated.manualPrice ?? updated.basePrice) || 0

      const discountPercent = updated.discountPercent ?? current.discountPercent ?? 0
      const discountAmount = updated.discountAmount ?? current.discountAmount ?? 0

      const byPercent = discountPercent > 0 ? currentPrice * (discountPercent / 100) : 0
      const rawDisc = discountAmount > 0 ? discountAmount : byPercent
      const discount = Math.min(Math.max(rawDisc, 0), Math.max(currentPrice, 0))

      updated.price = roundNumber(currentPrice - discount)
      updated.selectedPrice = updated.price
    }

    itemsField.update(index, updated)
  }

  useBarcodeScanned(async (barcode: string) => {
    const products = await getBarcode(barcode)
    for (const product of products) {
      addProduct(product, product.unitsPerScan)
    }
  })

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px] lg:items-start">
      <div className="min-w-0 space-y-4">
        <OrderClientSection
          value={clientId || undefined}
          onChange={id => informationForm.setValue('client', id || '', { shouldDirty: true })}
          onCreate={openClientModal}
          disabled={isLoading}
          titlePrefix="edit-order"
        />
        <OrderProductsSection
          products={items}
          addProduct={addProduct}
          removeProduct={removeProduct}
          changeProduct={updateProduct}
          isLoading={isLoading}
          titlePrefix="edit-order"
          isProfit
        />
        <InformationForm form={informationForm} onSubmit={onSubmitInformation} />
        <OrderFilesSection
          files={files}
          setFiles={setFiles}
          isLoading={isLoading}
          titlePrefix="edit-order"
        />
        <PaymentForm form={paymentForm} onSubmit={onSubmitPayment} />
        <ClientForm form={clientForm} onSubmit={onSubmitClient} />
      </div>

      <OrderSidebar
        items={items}
        payments={payments}
        titlePrefix="edit-order"
        isLoading={isLoading}
        onAddPayment={openPaymentModal}
        onRemovePayment={removePayment}
        actions={(
          <OrderSidebarSubmitButton
            isLoading={isLoading}
            label={t('button.submit')}
          />
        )}
      />
    </div>
  )
}
