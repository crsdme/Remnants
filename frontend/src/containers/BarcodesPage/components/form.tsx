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
  Separator,
} from '@/components/ui'
import { useBarcodeContext } from '@/contexts'
import { useBarcodeScanned } from '@/utils/hooks'

export function BarcodeForm() {
  const { isLoading, form, submitBarcodeForm, setSelectedProducts, selectedProducts, generateBarcode, closeModal, getBarcode } = useBarcodeContext()
  const { t } = useTranslation()

  const onSubmit = (values) => {
    values.products = selectedProducts.map((product: any) => ({
      id: product.id,
      quantity: product.selectedQuantity,
    }))
    submitBarcodeForm(values)
  }

  const addProduct = (products, selectedQuantity = 1) => {
    products.forEach((product: any) => {
      setSelectedProducts((state) => {
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
    setSelectedProducts(prev => prev.filter(p => p.id !== product.id))
  }

  const changeQuantity = (product: any, quantity: number) => {
    setSelectedProducts(prev => prev.map(p => p.id === product.id ? { ...p, selectedQuantity: quantity } : p))
  }

  useBarcodeScanned(async (barcode: string) => {
    const data = await getBarcode(barcode)
    addProduct(data?.[0]?.products || [])
  })

  return (
    <Form {...form}>
      <ProductTable addProduct={addProduct} />
      <Separator className="my-4" />
      <ProductSelectedTable products={selectedProducts} removeProduct={removeProduct} isLoading={isLoading} changeQuantity={changeQuantity} />
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
