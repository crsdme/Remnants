import type { ProductPopulatedDTO } from '@remnant/shared'

import type { BaseProductRow } from '@/components/ProductSelectedTableNew'
import { createColumnHelper } from '@tanstack/react-table'
import { useFieldArray } from 'react-hook-form'

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
import { useLocale } from '@/utils/hooks'
import { useCreateProcurementContext } from '../context'

type CreateProcurementProductRow = ProductPopulatedDTO & BaseProductRow & {
  product?: string
  productId?: string
  selectedPrice?: number
  selectedCurrency?: ProductPopulatedDTO['currency']
  purchasePrice?: number
  purchaseCurrencyId?: ProductPopulatedDTO['currency']
  receivedQuantity?: number
}

const procurementProductColumnHelper = createColumnHelper<CreateProcurementProductRow>()

export function DataTable() {
  const { isLoading, form, submitCreateProcurementForm } = useCreateProcurementContext()
  const { t, language } = useLocale()

  const itemsField = useFieldArray({
    control: form.control,
    name: 'items',
  })

  const addProduct = (product: ProductPopulatedDTO, selectedQuantity = 1) => {
    const selectedProducts = form.getValues('items')
    const existing = selectedProducts.find(p => p.id === product.id)

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
        quantity: selectedQuantity,
        purchasePrice: product.price,
        purchaseCurrencyId: product.currency,
      })
    }
  }

  const removeProduct = (product: { id: string }) => {
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

    // if (field === 'receivedQuantity') {
    //   updated.receivedQuantity = value ?? current.receivedQuantity ?? 0
    // }

    if (field === 'quantity') {
      updated.quantity = value ?? current.quantity
    }

    itemsField.update(index, updated)
  }

  const loadSupplierOptions = useSupplierOptions()

  const loadCurrencyOptions = useCurrencyOptions()

  const { currencies } = useCurrencyQuery({ filters: { active: [true] } })

  const columns = [
    makeImagesColumn(procurementProductColumnHelper, { t }),
    makeNameColumn(procurementProductColumnHelper, { t, language }),
    makeSelectedPriceColumn(procurementProductColumnHelper, {
      t,
      language,
      currencies,
      loadCurrencyOptions,
      field: 'purchasePrice',
      currencyField: 'purchaseCurrencyId',
    }),
    makeQuantityColumn(procurementProductColumnHelper, { t, language, field: 'quantity' }),
    makeActionColumn(procurementProductColumnHelper, { t }),
  ].filter(Boolean)

  return (
    <Form {...form}>
      <ProductTable addProduct={addProduct} />
      <Separator className="my-4" />
      <ProductSelectedTableNew<CreateProcurementProductRow>
        products={(form.getValues('items') || []) as CreateProcurementProductRow[]}
        onChangeField={updateProduct}
        onRemoveRow={removeProduct}
        columns={columns}
        isLoading={isLoading}
      />
      <Separator className="my-4" />
      <form
        className="w-full space-y-1 mt-4"
        onSubmit={(e) => { void form.handleSubmit(submitCreateProcurementForm)(e) }}
      >

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
            name="supplierId"
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
