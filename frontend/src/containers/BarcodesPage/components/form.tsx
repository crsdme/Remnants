import { ScanBarcode } from 'lucide-react'
import { useFieldArray } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { ProductSelectedTable, ProductTable } from '@/components'
import {
  Button,
  Checkbox,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Separator,
} from '@/components/ui'
import { useBarcodeContext } from '@/contexts'
import { useBarcodeScanned } from '@/utils/hooks'

export function BarcodeForm() {
  const { isLoading, form, submitBarcodeForm, generateBarcode, closeModal, getBarcode } = useBarcodeContext()
  const { t } = useTranslation()

  const productsField = useFieldArray({
    control: form.control,
    name: 'products',
  })

  const onSubmit = (values) => {
    submitBarcodeForm(values)
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

  const removeProduct = (product) => {
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

    const current = selectedProducts[index]
    const updated = { ...current, [field]: value }

    if (field === 'quantity') {
      updated.quantity = value ?? current.quantity
    }

    productsField.update(index, updated)
  }

  useBarcodeScanned(async (barcode: string) => {
    const data = await getBarcode(barcode)
    addProduct(data?.[0]?.products || [])
  })

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
      />
      <Separator className="my-4" />
      <form className="w-full space-y-1 mt-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>{t('page.barcodes.form.code')}</FormLabel>
              <div className="flex items-center gap-2">
                <FormControl>
                  <Input
                    type="number"
                    placeholder={t('page.barcodes.form.code')}
                    className="w-full"
                    {...field}
                    disabled={isLoading}
                    onChange={e => field.onChange(e.target.value)}
                  />
                </FormControl>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => generateBarcode()}
                >
                  <ScanBarcode />
                  {t('button.generate')}
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                />
              </FormControl>
              <FormLabel>{t('page.barcodes.form.active')}</FormLabel>
            </FormItem>
          )}
        />
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
