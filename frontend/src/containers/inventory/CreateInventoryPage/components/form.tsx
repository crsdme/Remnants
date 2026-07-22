import type { ProductPopulatedDTO } from '@remnant/shared'
import { useMemo, useState } from 'react'
import { useFieldArray, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
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
import { useDebounceCallback, useLocale } from '@/utils/hooks'
import { useCreateInventoryContext } from '../context'
import { ProductSelectedTable } from './ProductTable'

function getWarehouseStock(product: ProductPopulatedDTO, warehouseId: string) {
  return product.warehouseStock.find(stock => stock.warehouse === warehouseId)?.count ?? 0
}

export function CreateInventoryForm() {
  const { t, language } = useLocale()
  const navigate = useNavigate()
  const { form, isLoading, submitInventoryForm, onError } = useCreateInventoryContext()
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  })

  const selectedCategories = useWatch({
    control: form.control,
    name: 'categories',
  })

  const selectedWarehouse = useWatch({
    control: form.control,
    name: 'warehouse',
  })

  const selectedItems = useWatch({
    control: form.control,
    name: 'items',
  })

  const itemsField = useFieldArray({
    control: form.control,
    name: 'items',
  })

  const canLoadProducts = selectedCategories.length > 0 && !!selectedWarehouse

  const { products, productsCount, isLoading: isProductsLoading, isFetching: isProductsFetching } = useProductQuery(
    { pagination, filters: { categories: selectedCategories }, sorters: {} },
    {
      options: {
        enabled: canLoadProducts,
        placeholderData: prevData => prevData,
      },
    },
  )

  const changeProduct = ({ productId, field, value }: { productId: string, field: string, value: number }) => {
    const items = form.getValues('items')
    const product = products.find(p => p.id === productId)
    const warehouseQty = product ? getWarehouseStock(product, selectedWarehouse) : 0
    const index = items.findIndex(item => item.id === productId)

    if (index !== -1) {
      itemsField.update(index, {
        ...items[index],
        [field]: value,
      })
      return
    }

    if (!product)
      return

    itemsField.append({
      id: productId,
      lineQuantity: warehouseQty,
      receivedQuantity: field === 'receivedQuantity' ? value : 0,
    })
  }

  const changePagination = useDebounceCallback((value: Pagination) => {
    setPagination(state => ({ ...state, ...value }))
  }, 50)

  const loadWarehouseOptions = useWarehouseOptions()
  const loadCategoryOptions = useCategoryOptions()

  const mergedProducts = useMemo(() => {
    return products.map((product) => {
      const item = selectedItems.find(i => i.id === product.id)
      const warehouseQty = getWarehouseStock(product, selectedWarehouse)

      return {
        ...product,
        lineQuantity: item?.lineQuantity ?? warehouseQty,
        receivedQuantity: item?.receivedQuantity ?? 0,
      }
    })
  }, [products, selectedItems, selectedWarehouse])

  const isTableLoading = isLoading || isProductsLoading || isProductsFetching

  return (
    <Form {...form}>
      <form
        className="w-full space-y-1"
        onSubmit={(e) => { void form.handleSubmit(submitInventoryForm, onError)(e) }}
      >
        <div className="flex flex-wrap gap-2">
          <FormField
            control={form.control}
            name="warehouse"
            render={({ field }) => (
              <FormItem className="min-w-[200px] flex-1">
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
                    renderOption={e => e.names[language]}
                    getDisplayValue={e => e.names[language]}
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
            name="categories"
            render={({ field }) => (
              <FormItem className="min-w-[200px] flex-1">
                <FormLabel>
                  <p>
                    {t('page.create-inventory.form.categories')}
                    <span className="text-destructive ml-1">*</span>
                  </p>
                </FormLabel>
                <FormControl>
                  <AsyncSelectNew
                    {...field}
                    multi
                    onChange={(value) => {
                      field.onChange(value)
                      form.setValue('items', [])
                      setPagination(state => ({ ...state, current: 1 }))
                    }}
                    loadOptions={loadCategoryOptions}
                    renderOption={e => e.names[language]}
                    getDisplayValue={e => e.names[language]}
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
              <FormItem className="min-w-[200px] flex-1">
                <FormLabel>
                  <p>{t('page.create-inventory.form.comment')}</p>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t('page.create-inventory.form.comment')}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator className="my-4" />

        {canLoadProducts
          ? (
              <ProductSelectedTable
                products={mergedProducts}
                productsCount={productsCount}
                isLoading={isTableLoading}
                changeProduct={changeProduct}
                pagination={pagination}
                changePagination={changePagination}
                lastAddedProductId={null}
              />
            )
          : (
              <p className="text-sm text-muted-foreground py-8 text-center">
                {t('page.create-inventory.form.selectScope')}
              </p>
            )}

        <Separator className="my-4" />

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => void navigate('/inventories')}
            disabled={isLoading}
          >
            {t('button.cancel')}
          </Button>
          <Button type="submit" disabled={isLoading || !canLoadProducts} loading={isLoading}>
            {t('button.submit')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
