import type { WarehouseDTO } from '@remnant/shared'
import { useFieldArray, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useWarehouseOptions } from '@/api/hooks'
import { ProductSelectedTable, ProductTable } from '@/components'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Switch,
} from '@/components/ui'
import { useLocale } from '@/utils/hooks'
import { useWarehouseTransactionContext } from '../context'

export function WarehouseTransactionForm() {
  const { isLoading, form, submitWarehouseTransactionForm } = useWarehouseTransactionContext()
  const { t, language } = useLocale()
  const navigate = useNavigate()

  const type = useWatch({
    control: form.control,
    name: 'type',
  })

  const productsField = useFieldArray({
    control: form.control,
    name: 'products',
  })

  const addProduct = (product: any, selectedQuantity = 1) => {
    const selectedProducts = form.getValues('products')
    const existing = selectedProducts.find(p => p.id === product.id)

    if (existing) {
      const index = selectedProducts.findIndex(p => p.id === product.id)
      productsField.update(index, {
        ...existing,
        lineQuantity: existing.lineQuantity + selectedQuantity,
      })
    }
    else {
      productsField.append({
        ...product,
        product: product.id,
        lineQuantity: selectedQuantity,
        receivedQuantity: 0,
      })
    }
  }

  const removeProduct = (product: any) => {
    const selectedProducts = form.getValues('products')
    const index = selectedProducts.findIndex(p => p.id === product.id)
    if (index !== -1) {
      productsField.remove(index)
    }
  }

  const updateProduct = ({ productId, field, value }: { productId: string, field: string, value: any }) => {
    const selectedProducts = form.getValues('products')
    const index = selectedProducts.findIndex(p => p.id === productId)

    if (index === -1)
      return

    const current = { ...selectedProducts[index], receivedQuantity: 0 }
    const updated = { ...current, [field]: value }

    if (field === 'receivedQuantity') {
      updated.receivedQuantity = value ?? current.receivedQuantity ?? 0
    }

    if (field === 'lineQuantity') {
      updated.lineQuantity = value ?? current.lineQuantity
    }

    productsField.update(index, updated)
  }

  // useBarcodeScanned(async (barcode: string) => {
  //   const products = await getBarcode(barcode)
  //   for (const { product, quantity } of products) {
  //     addProduct(product, quantity)
  //   }
  // })

  const loadWarehouseOptions = useWarehouseOptions()

  return (
    <Form {...form}>
      <ProductTable addProduct={addProduct} />
      <Separator className="my-4" />
      <ProductSelectedTable
        products={form.getValues('products') || []}
        removeProduct={removeProduct}
        isLoading={isLoading}
        changeProduct={updateProduct}
        includeFooterTotal={true}
        isQuantity={true}
      />
      <Separator className="my-4" />
      <form
        className="w-full space-y-1 mt-4"
        onSubmit={(e) => { void form.handleSubmit(submitWarehouseTransactionForm)(e) }}
      >

        <div className="flex gap-2">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="min-w-[200px]">
                <FormLabel>
                  <p>
                    {t('page.warehouse-transactions.form.type')}
                    <span className="text-destructive ml-1">*</span>
                  </p>
                </FormLabel>

                <Select
                  onValueChange={(e) => {
                    field.onChange(e)
                    form.setValue('fromWarehouse', '')
                    form.setValue('toWarehouse', '')
                  }}
                  disabled={isLoading}
                  {...field}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t('page.money-transactions.form.cashregister')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="in">
                      {t('page.warehouse-transactions.form.type.in')}
                    </SelectItem>
                    <SelectItem value="out">
                      {t('page.warehouse-transactions.form.type.out')}
                    </SelectItem>
                    <SelectItem value="transfer">
                      {t('page.warehouse-transactions.form.type.transfer')}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {['out', 'transfer'].includes(type) && (
            <FormField
              control={form.control}
              name="fromWarehouse"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <p>
                      {t('page.warehouse-transactions.form.fromWarehouse')}
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
                      onChange={(e) => {
                        field.onChange(e)
                        form.setValue('toWarehouse', '')
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {['in', 'transfer'].includes(type) && (
            <FormField
              control={form.control}
              name="toWarehouse"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <p>
                      {t('page.warehouse-transactions.form.toWarehouse')}
                      <span className="text-destructive ml-1">*</span>
                    </p>
                  </FormLabel>
                  <FormControl>
                    <AsyncSelectNew
                      {...field}
                      loadOptions={async (params) => {
                        const data = await loadWarehouseOptions({
                          query: params?.query ?? '',
                          selectedValue: params?.selectedValue ?? [],
                        })

                        const excludeId = form.watch('fromWarehouse')
                        const warehouses = data.filter((d: WarehouseDTO) => d.id !== excludeId)

                        return warehouses
                      }}
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
          )}

          {['transfer'].includes(type) && (
            <FormField
              control={form.control}
              name="requiresReceiving"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <p>
                      {t('page.warehouse-transactions.form.requiresReceiving')}
                    </p>
                  </FormLabel>
                  <FormControl>
                    <Switch
                      name="requiresReceiving"
                      defaultChecked={true}
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <p>
                    {t('page.warehouse-transactions.form.comment')}
                  </p>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t('page.warehouse-transactions.form.comment')}
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
            onClick={() => { void navigate('/warehouse-transactions') }}
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
