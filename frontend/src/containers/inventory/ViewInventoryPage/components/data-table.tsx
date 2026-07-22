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
import { useViewInventoryContext } from '../context'
import { ProductSelectedTable } from './ProductTable'

export function DataTable() {
  const { t, language } = useLocale()
  const navigate = useNavigate()
  const { form, isLoading } = useViewInventoryContext()
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

  const itemsField = useFieldArray({
    control: form.control,
    name: 'items',
  })

  const { products, productsCount } = useProductQuery(
    { pagination, filters: { categories: selectedCategories }, sorters: {} },
    {
      options: {
        enabled: selectedCategories.length > 0 && !!selectedWarehouse,
      },
    },
  )

  const changeProduct = ({ productId, field, value }: { productId: string, field: string, value: any }) => {
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
        lineQuantity: 1,
        receivedQuantity: 1,
      })
    }
  }

  const changePagination = useDebounceCallback((value: Pagination) => {
    setPagination(state => ({ ...state, ...value }))
  }, 50)

  const loadWarehouseOptions = useWarehouseOptions()
  const loadCategoryOptions = useCategoryOptions()

  const mergedProducts = useMemo(() => {
    const selectedItems = form.watch('items')
    return products.map((product: any) => {
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
      />
      <Separator className="my-4" />
      <form className="w-full space-y-1 mt-4">

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
              <FormItem>
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
                    onChange={(e) => {
                      field.onChange(e)
                      form.setValue('items', [])
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
            onClick={() => void navigate('/inventories')}
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
