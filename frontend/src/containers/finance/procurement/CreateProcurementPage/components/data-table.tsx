import type { ProductPopulatedDTO } from '@remnant/shared'

import type { BaseProductRow } from '@/components/ProductSelectedTableNew'
import { createColumnHelper } from '@tanstack/react-table'
import { ClipboardList, FileText, MessageSquare, Package, Plus, ShoppingCart } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useFieldArray, useWatch } from 'react-hook-form'

import { useCurrencyOptions, useCurrencyQuery, useProductPropertyQuery, useSupplierOptions, useWarehouseOptions } from '@/api/hooks'
import { ProductSelectedTableNew, ProductTable } from '@/components'
import { AsyncSelectNew } from '@/components/AsyncSelectNew'
import {
  formatQuantitiesByUnit,
  makeActionColumn,
  makeBarcodesColumn,
  makeCategoriesColumn,
  makeImagesColumn,
  makeNameColumn,
  makeProductPropertyColumns,
  makeQuantityColumn,
  makeSelectedPriceColumn,
  makeSeqColumn,
  makeUnitColumn,
} from '@/components/ProductSelectedTableNew/columns'

import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Separator,
  Textarea,
} from '@/components/ui'
import { useEntityIdsWithCapability, useLocale } from '@/utils/hooks'
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

const PROCUREMENT_CREATE_FORM_ID = 'procurement-create-form'
const procurementProductColumnHelper = createColumnHelper<CreateProcurementProductRow>()

function formatAmount(value: number) {
  const rounded = Math.round(value * 100) / 100
  return Number(rounded).toString()
}

export function DataTable() {
  const { isLoading, isEdit, form, submitCreateProcurementForm } = useCreateProcurementContext()
  const { t, language } = useLocale()
  const [catalogOpen, setCatalogOpen] = useState(false)

  const items = (useWatch({ control: form.control, name: 'items' }) || []) as CreateProcurementProductRow[]

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
        purchasePrice: product.purchasePrice ?? 0,
        purchaseCurrencyId: product.purchaseCurrency ?? product.currency,
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

    if (field === 'quantity') {
      updated.quantity = value ?? current.quantity
    }

    itemsField.update(index, updated)
  }

  const loadSupplierOptions = useSupplierOptions()
  const loadWarehouseOptions = useWarehouseOptions()
  const receiveWarehouseIds = useEntityIdsWithCapability('warehouses', 'receive')
  const loadReceiveWarehouseOptions = useCallback(
    async (params?: { query?: string, selectedValue?: string[] }) => {
      const options = await loadWarehouseOptions(params)
      if (receiveWarehouseIds == null)
        return options
      const allowed = new Set(receiveWarehouseIds)
      return options.filter(option => allowed.has(option.id))
    },
    [loadWarehouseOptions, receiveWarehouseIds],
  )

  const loadCurrencyOptions = useCurrencyOptions()
  const { currencies } = useCurrencyQuery({ filters: { active: [true] } })
  const { productProperties } = useProductPropertyQuery({
    filters: { active: [true], language, showInTable: true },
    pagination: { full: true },
  })

  const columns = [
    makeImagesColumn(procurementProductColumnHelper, { t }),
    makeSeqColumn(procurementProductColumnHelper, { t, defaultVisible: true }),
    makeNameColumn(procurementProductColumnHelper, { t, language }),
    makeBarcodesColumn(procurementProductColumnHelper, { t, defaultVisible: true }),
    makeCategoriesColumn(procurementProductColumnHelper, { t, language, defaultVisible: true }),
    makeUnitColumn(procurementProductColumnHelper, { t, language, defaultVisible: true }),
    ...makeProductPropertyColumns(procurementProductColumnHelper, { t, language, productProperties }),
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

  const itemsCount = items.reduce((sum, item) => sum + (item.quantity ?? 0), 0)
  const totalsByCurrency = items.reduce((acc, item) => {
    const symbol = item.purchaseCurrencyId?.symbols?.[language]
      || item.currency?.symbols?.[language]
      || ''
    if (!symbol)
      return acc
    acc[symbol] = (acc[symbol] ?? 0) + (item.quantity ?? 0) * (item.purchasePrice ?? 0)
    return acc
  }, {} as Record<string, number>)
  const totalEntries = Object.entries(totalsByCurrency)

  return (
    <Form {...form}>
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px] lg:items-start">
        <div className="min-w-0 space-y-4">
          <div className="space-y-3 rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2">
              <Package className="size-5 shrink-0" />
              <p className="text-lg font-bold">{t('page.procurements.form.products')}</p>
              <Separator className="flex-1" />
              <Button
                type="button"
                size="sm"
                variant={catalogOpen ? 'secondary' : 'default'}
                onClick={() => setCatalogOpen(open => !open)}
                disabled={isLoading}
              >
                <Plus className="size-4" />
                {t('page.procurements.form.add-product')}
              </Button>
            </div>

            {catalogOpen && (
              <ProductTable addProduct={addProduct} />
            )}

            {items.length === 0
              ? (
                  <button
                    type="button"
                    className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 py-10 text-center transition-colors hover:border-primary/40 hover:bg-muted/30"
                    onClick={() => setCatalogOpen(true)}
                    disabled={isLoading}
                  >
                    <ShoppingCart className="size-8 text-muted-foreground/50" />
                    <p className="text-sm font-medium text-muted-foreground">
                      {t('page.procurements.form.products-empty')}
                    </p>
                    <span className="inline-flex items-center gap-1 text-sm text-primary">
                      <Plus className="size-3.5" />
                      {t('page.procurements.form.add-product')}
                    </span>
                  </button>
                )
              : (
                  <ProductSelectedTableNew<CreateProcurementProductRow>
                    products={items}
                    onChangeField={updateProduct}
                    onRemoveRow={removeProduct}
                    columns={columns}
                    isLoading={isLoading}
                    tableId="procurement-create-products"
                  />
                )}
          </div>

          <form
            id={PROCUREMENT_CREATE_FORM_ID}
            className="space-y-4"
            onSubmit={(e) => { void form.handleSubmit(submitCreateProcurementForm)(e) }}
          >
            <div className="space-y-3 rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2">
                <ClipboardList className="size-5 shrink-0" />
                <p className="text-lg font-bold">{t('page.procurements.form.information')}</p>
                <Separator className="flex-1" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="supplierId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <p>
                          {t('page.procurements.form.supplier')}
                          <span className="text-destructive ml-1">*</span>
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

                <FormField
                  control={form.control}
                  name="warehouseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <p>
                          {t('page.procurements.form.warehouse')}
                          <span className="text-destructive ml-1">*</span>
                        </p>
                      </FormLabel>
                      <FormControl>
                        <AsyncSelectNew
                          {...field}
                          loadOptions={loadReceiveWarehouseOptions}
                          renderOption={e => e.names[language]}
                          getDisplayValue={e => e.names[language]}
                          getOptionValue={e => e.id}
                          placeholder={t('page.procurements.form.warehouse')}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-3 rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="size-5 shrink-0" />
                <p className="text-lg font-bold">{t('page.procurements.form.comment')}</p>
                <Separator className="flex-1" />
              </div>
              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder={t('page.procurements.form.comment')}
                        className="w-full resize-none"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-4">
          <div className="space-y-3 rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2">
              <FileText className="size-5 shrink-0" />
              <p className="text-lg font-bold">{t('page.procurements.form.procurement-total')}</p>
              <Separator className="flex-1" />
            </div>
            <div className="flex items-start justify-between gap-3 text-sm">
              <span className="text-muted-foreground">
                {t('page.procurements.form.items-count', { count: itemsCount })}
              </span>
              <span className="tabular-nums text-right">
                {formatQuantitiesByUnit(items as unknown as Array<Record<string, unknown>>, 'quantity', language)}
              </span>
            </div>
            <div className="flex items-start justify-between gap-3 border-t pt-3">
              <span className="font-semibold">{t('page.procurements.form.total')}</span>
              <div className="flex flex-col items-end gap-0.5 text-base font-semibold tabular-nums">
                {totalEntries.length > 0
                  ? totalEntries.map(([symbol, sum]) => (
                      <span key={symbol}>
                        {formatAmount(sum)}
                        {' '}
                        {symbol}
                      </span>
                    ))
                  : <span>0</span>}
              </div>
            </div>
          </div>
          <Button
            type="submit"
            form={PROCUREMENT_CREATE_FORM_ID}
            disabled={isLoading}
            loading={isLoading}
            className="w-full"
          >
            {t(isEdit ? 'button.save' : 'button.submit')}
          </Button>
        </aside>
      </div>
    </Form>
  )
}
