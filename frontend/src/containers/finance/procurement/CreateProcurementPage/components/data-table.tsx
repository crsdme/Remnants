import { useFieldArray } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useCurrencyOptions, useCurrencyQuery, useSupplierOptions } from '@/api/hooks'
import { ProductSelectedTableNew, ProductTable } from '@/components'
import { AsyncSelectNew } from '@/components/AsyncSelectNew'
import {
  makeActionColumn,
  makeImagesColumn,
  makeNameColumn,
  makeQuantityColumn,
  makeSelectedPriceColumn,
} from '@/components/ProductSelectedTableNew/columns'

import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Separator,
} from '@/components/ui'
import { useBarcodeScanned } from '@/utils/hooks'
import { useCreateProcurementContext } from '../context'

export function DataTable() {
  const { isLoading, form, submitCreateProcurementForm, onError, getBarcode } = useCreateProcurementContext()
  const { t, i18n } = useTranslation()

  const itemsField = useFieldArray({
    control: form.control,
    name: 'items',
  })

  const onSubmit = (value) => {
    submitCreateProcurementForm(value)
  }

  const addProduct = (product, selectedQuantity = 1) => {
    const selectedProducts = form.getValues('items')
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
        selectedPrice: product.price,
        selectedCurrency: product.currency,
        quantity: selectedQuantity,
        receivedQuantity: 0,
      })
    }
  }

  const removeProduct = (product) => {
    const selectedProducts = form.getValues('items')
    const index = selectedProducts.findIndex(p => p.id === product.id)
    if (index !== -1) {
      itemsField.remove(index)
    }
  }

  const updateProduct = ({ productId, field, value }: { productId: string, field: string, value: any }) => {
    const selectedProducts = form.getValues('items')
    const index = selectedProducts.findIndex(p => p.id === productId)

    if (index === -1)
      return

    const current = selectedProducts[index]
    const updated = { ...current, [field]: value }

    if (field === 'receivedQuantity') {
      updated.receivedQuantity = value ?? current.receivedQuantity ?? 0
    }

    if (field === 'quantity') {
      updated.quantity = value ?? current.quantity
    }

    itemsField.update(index, updated)
  }

  useBarcodeScanned(async (barcode: string) => {
    const products = await getBarcode(barcode)
    for (const { product, quantity } of products) {
      addProduct(product, quantity)
    }
  })

  const loadSupplierOptions = useSupplierOptions()

  const loadCurrencyOptions = useCurrencyOptions()

  const { data: { currencies = [] } = {} } = useCurrencyQuery(
    {},
    { options: {
      select: response => ({
        currencies: response.data.currencies,
      }),
    } },
  )

  const columns = [
    makeImagesColumn({ t }),
    makeNameColumn({ t, i18n }),
    makeSelectedPriceColumn({ t, i18n, currencies, loadCurrencyOptions, field: 'purchasePrice', currencyField: 'purchaseCurrency' }),
    makeQuantityColumn({ t, i18n, field: 'quantity' }),
    makeActionColumn({ t }),
  ].filter(Boolean)

  return (
    <Form {...form}>
      <ProductTable addProduct={addProduct} />
      <Separator className="my-4" />
      <ProductSelectedTableNew
        products={form.getValues('items') || []}
        onChangeField={updateProduct}
        onRemoveRow={removeProduct}
        columns={columns}
        isLoading={isLoading}
      />
      <Separator className="my-4" />
      <form className="w-full space-y-1 mt-4" onSubmit={form.handleSubmit(onSubmit, onError)}>

        <div className="flex gap-2">
          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <p>
                    {t('page.procurements.form.comment')}
                  </p>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t('page.procurements.form.comment')}
                    className="resize-none"
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="supplier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <p>
                    {t('page.procurements.form.supplier')}
                  </p>
                </FormLabel>
                <FormControl>
                  <AsyncSelectNew
                    {...field}
                    loadOptions={loadSupplierOptions}
                    renderOption={e => e.name}
                    getDisplayValue={e => e.name}
                    getOptionValue={e => e.id}
                    placeholder={t('page.procurements.form.supplier')}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

        </div>
        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isLoading} loading={isLoading}>
            {t('button.submit')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
