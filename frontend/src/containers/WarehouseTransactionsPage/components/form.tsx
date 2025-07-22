import { useFieldArray, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useWarehouseOptions } from '@/api/hooks'
import { AsyncSelect, ProductSelectedTable, ProductTable } from '@/components'
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
import { useWarehouseTransactionContext } from '@/contexts'
import { useBarcodeScanned } from '@/utils/hooks'

export function WarehouseTransactionForm() {
  const { isLoading, form, submitWarehouseTransactionForm, closeModal, onError, isReceiving, getBarcode } = useWarehouseTransactionContext()
  const { t, i18n } = useTranslation()

  const type = useWatch({
    control: form.control,
    name: 'type',
  })

  const productsField = useFieldArray({
    control: form.control,
    name: 'products',
  })

  const onSubmit = (value) => {
    submitWarehouseTransactionForm(value)
  }

  const addProduct = (product, selectedQuantity = 1) => {
    const selectedProducts = form.getValues('products')
    const existing = selectedProducts.find(p => p.id === product.id) as any

    if (existing) {
      const index = selectedProducts.findIndex(p => p.id === product.id)
      productsField.update(index, {
        ...existing,
        quantity: existing.quantity + selectedQuantity,
      })
    }
    else {
      productsField.append({
        ...product,
        product: product.id,
        quantity: selectedQuantity,
        receivedQuantity: 0,
      })
    }
  }

  // const addProduct = (products, selectedQuantity = 1) => {
  //   const selectedProducts = form.getValues('products')
  //   products.forEach((product) => {
  //     const existing = selectedProducts.find(p => p.id === product.id) as any

  //     if (existing) {
  //       const index = selectedProducts.findIndex(p => p.id === product.id)
  //       productsField.update(index, {
  //         ...existing,
  //         quantity: existing.quantity + selectedQuantity,
  //       })
  //     }
  //     else {
  //       productsField.append({
  //         ...product,
  //         id: product.id,
  //         quantity: selectedQuantity,
  //         receivedQuantity: 0,
  //       })
  //     }
  //   })
  // }

  const removeProduct = (product) => {
    const selectedProducts = form.getValues('products')
    const index = selectedProducts.findIndex(p => p.id === product.id)
    if (index !== -1) {
      productsField.remove(index)
    }
  }

  const changeQuantity = (product, { quantity, receivedQuantity }: { quantity?: number, receivedQuantity?: number }) => {
    const selectedProducts = form.getValues('products')
    const index = selectedProducts.findIndex(p => p.id === product.id)
    if (index !== -1) {
      productsField.update(index, {
        ...selectedProducts[index],
        quantity: quantity ?? product.quantity,
        receivedQuantity: receivedQuantity ?? product.receivedQuantity ?? 0,
      })
    }
  }

  useBarcodeScanned(async (barcode: string) => {
    const products = await getBarcode(barcode)
    for (const { product, quantity } of products) {
      addProduct(product, quantity)
    }
  })

  const loadWarehouseOptions = useWarehouseOptions()

  return (
    <Form {...form}>
      <ProductTable addProduct={addProduct} />
      <Separator className="my-4" />
      <ProductSelectedTable products={form.getValues('products') || []} removeProduct={removeProduct} isLoading={isLoading} changeQuantity={changeQuantity} isReceiving={isReceiving} />
      <Separator className="my-4" />
      <form className="w-full space-y-1 mt-4" onSubmit={form.handleSubmit(onSubmit, onError)}>

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
                  value={field.value}
                  onValueChange={(e) => {
                    field.onChange(e)
                    form.setValue('fromWarehouse', '')
                    form.setValue('toWarehouse', '')
                  }}
                  disabled={isLoading || isReceiving}
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
                      renderOption={e => e.names[i18n.language]}
                      getDisplayValue={e => e.names[i18n.language]}
                      getOptionValue={e => e.id}
                      disabled={isLoading || isReceiving}
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
                      loadOptions={(params) => {
                        return loadWarehouseOptions({ query: params.query, selectedValue: params.selectedValue }).then((data) => {
                          const excludeIds = form.watch('fromWarehouse') || []
                          const warehouses = data.filter((d: any) => !excludeIds.includes(d.id))
                          return warehouses
                        })
                      }}
                      renderOption={e => e.names[i18n.language]}
                      getDisplayValue={e => e.names[i18n.language]}
                      getOptionValue={e => e.id}
                      disabled={isLoading || isReceiving}
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
                      disabled={isLoading || isReceiving}
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
                    disabled={isLoading || isReceiving}
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
            onClick={() => closeModal()}
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
