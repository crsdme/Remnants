import { useCallback, useMemo, useState } from 'react'

import { useFieldArray, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useCategoryOptions, useProductQuery, useWarehouseOptions } from '@/api/hooks'
import { AsyncSelectNew } from '@/components/AsyncSelectNew'
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
import { useCreateInventoryContext } from '@/contexts'
import { useBarcodeScanned, useDebounceCallback } from '@/utils/hooks'
import { ProductSelectedTable } from './ProductTable'

export function DataTable() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { form, isLoading, submitInventoryForm } = useCreateInventoryContext()
  const [lastAddedProductId, setLastAddedProductId] = useState(null)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  })

  const { getBarcode } = useCreateInventoryContext()

  const selectedCategory = useWatch({
    control: form.control,
    name: 'category',
  })

  const selectedWarehouse = useWatch({
    control: form.control,
    name: 'warehouse',
  })

  const itemsField = useFieldArray({
    control: form.control,
    name: 'items',
  })

  const { data: { products = [], productsCount = 0 } = {} } = useProductQuery(
    { pagination, filters: { categories: [selectedCategory] }, sorters: {} },
    { options: {
      enabled: !!selectedCategory && !!selectedWarehouse,
      select: (response) => {
        const products = response.data.products.map((product) => {
          return {
            ...product,
            quantity: product.quantity.find(q => q.warehouse === selectedWarehouse)?.count || 0,
            receivedQuantity: 0,
          }
        })

        return {
          products,
          productsCount: response.data.productsCount,
        }
      },
      placeholderData: prevData => prevData,
    } },
  )

  const onSubmit = (value) => {
    submitInventoryForm(value)
  }

  const addProduct = (product, selectedQuantity = 1) => {
    const selectedItems = form.getValues('items')
    const existing = selectedItems.find(p => p.id === product.id) as any

    if (product.index === -1) {
      toast.error(t('form.errors.required.product'))
      setLastAddedProductId(null)
      return
    }

    if (existing) {
      const index = selectedItems.findIndex(p => p.id === product.id)
      itemsField.update(index, {
        ...existing,
        receivedQuantity: existing.receivedQuantity + selectedQuantity,
      })
    }
    else {
      itemsField.append({
        ...product,
        receivedQuantity: selectedQuantity,
        quantity: product.quantity.find(q => q.warehouse === selectedWarehouse)?.count || 0,
        id: product.id,
      })
    }
    setLastAddedProductId(product.id)
    toast.success(t('form.success.productAdded'))
    setPagination(state => ({ ...state, current: Math.ceil(product.index / 10) }))
  }

  const changeProduct = ({ productId, field, value }) => {
    const selectedItems = form.watch('items')

    const index = selectedItems.findIndex(p => p.id === productId)
    if (index !== -1) {
      const updated = { ...selectedItems[index], [field]: value }
      itemsField.update(index, updated)
    }
    else {
      const product = products.find(p => p.id === productId)
      if (!product)
        return

      itemsField.append({
        id: product.id,
        quantity: product.quantity,
        receivedQuantity: 1,
      })
    }
  }

  useBarcodeScanned(async (barcode: string) => {
    if (!selectedCategory) {
      toast.error(t('page.create-inventory.form.category.required'))
      return
    }

    const response = await getBarcode({ barcode, category: selectedCategory })
    for (const { product, quantity } of response.inventoryItems) {
      product.index = response.productIndex
      addProduct(product, quantity)
    }
  })

  const changePagination = useDebounceCallback((value: Pagination) => {
    setPagination(state => ({ ...state, ...value }))
  }, 50)

  const loadWarehouseOptions = useWarehouseOptions()
  const loadCategoryOptions = useCategoryOptions()

  const mergedProducts = useMemo(() => {
    const selectedItems = form.watch('items')
    return products.map((product) => {
      const item = selectedItems.find(i => i.id === product.id)
      return {
        ...product,
        ...item,
      }
    })
  }, [products, itemsField.fields])

  return (
    <Form {...form}>
      <ProductSelectedTable
        products={mergedProducts}
        productsCount={productsCount}
        isLoading={isLoading}
        changeProduct={changeProduct}
        pagination={pagination}
        changePagination={changePagination}
        lastAddedProductId={lastAddedProductId}
      />
      <Separator className="my-4" />
      <form className="w-full space-y-1 mt-4" onSubmit={form.handleSubmit(onSubmit)}>

        <div className="flex gap-2">
          <FormField
            control={form.control}
            name="warehouse"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <p>
                    {t('page.create-inventory.form.warehouse')}
                    <span className="text-destructive ml-1">*</span>
                  </p>
                </FormLabel>
                <FormControl>
                  <AsyncSelectNew
                    {...field}
                    loadOptions={loadWarehouseOptions}
                    renderOption={e => e.names[i18n.language]}
                    getDisplayValue={e => e.names[i18n.language]}
                    getOptionValue={e => e.id}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <p>
                    {t('page.create-inventory.form.category')}
                    <span className="text-destructive ml-1">*</span>
                  </p>
                </FormLabel>
                <FormControl>
                  <AsyncSelectNew
                    {...field}
                    onChange={(e) => {
                      field.onChange(e)
                      form.setValue('items', [])
                    }}
                    loadOptions={loadCategoryOptions}
                    renderOption={e => e.names[i18n.language]}
                    getDisplayValue={e => e.names[i18n.language]}
                    getOptionValue={e => e.id}
                    disabled={isLoading}
                    searchable
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <p>
                    {t('page.create-inventory.form.comment')}
                  </p>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t('page.create-inventory.form.comment')}
                    className="resize-none"
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

        </div>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/inventories')}
            disabled={isLoading}
          >
            {t('button.cancel')}
          </Button>
          <Button type="submit" disabled={isLoading} loading={isLoading}>
            {t('button.submit')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
