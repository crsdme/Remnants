import { ScanBarcode } from 'lucide-react'
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
} from '@/components/ui'
import { useBarcodeContext } from '@/contexts'
import { useBarcodeScanned } from '@/utils/hooks'

export function BarcodeForm() {
  const barcodeContext = useBarcodeContext()
  const { t } = useTranslation()

  const { isLoading, form } = barcodeContext

  const onSubmit = (values) => {
    values.products = barcodeContext.selectedProducts.map((product: any) => ({
      id: product.id,
      quantity: product.selectedQuantity,
    }))
    barcodeContext.submitBarcodeForm(values)
  }

  const addProduct = (products, selectedQuantity = 1) => {
    products.forEach((product: any) => {
      barcodeContext.setSelectedProducts((state) => {
        const productIndex = state.findIndex(item => item.id === product.id)
        const quantity = typeof product.quantity === 'number' ? product.quantity : selectedQuantity
        if (productIndex !== -1) {
          const updatedProducts = [...state]
          updatedProducts[productIndex] = {
            ...updatedProducts[productIndex],
            selectedQuantity: updatedProducts[productIndex].selectedQuantity + quantity,
          }
          return updatedProducts
        }

        return [...state, { ...product, selectedQuantity: quantity }]
      })
    })
  }

  const removeProduct = (product: any) => {
    barcodeContext.setSelectedProducts(prev => prev.filter(p => p.id !== product.id))
  }

  useBarcodeScanned(async (barcode: string) => {
    const { data } = await barcodeContext.getBarcode(barcode)
    addProduct(data?.barcodes?.[0]?.products || [])
  })

  return (
    <Form {...form}>
      <ProductTable addProduct={addProduct} />
      <ProductSelectedTable products={barcodeContext.selectedProducts} removeProduct={removeProduct} isLoading={isLoading} />
      <form className="w-full space-y-4 mt-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex items-end gap-2">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>{t('page.barcodes.form.code')}</FormLabel>
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
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => form.setValue('code', '1234567890')}
          >
            <ScanBarcode />
            {t('button.generate')}
          </Button>

        </div>
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
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => barcodeContext.closeModal()}
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
