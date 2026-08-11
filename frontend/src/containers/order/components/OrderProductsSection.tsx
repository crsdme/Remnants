import type { ProductPopulatedDTO } from '@remnant/shared'
import { Package, Plus, ShoppingCart } from 'lucide-react'
import { useState } from 'react'
import { ProductSelectedTable, ProductTable } from '@/components'
import { Button, Separator } from '@/components/ui'
import { useLocale } from '@/utils/hooks'

interface OrderProductsSectionProps {
  products: any[]
  addProduct: (product: ProductPopulatedDTO, selectedQuantity?: number) => void
  removeProduct: (productId: string) => void
  changeProduct: (options: { productId: string, field: any, value: any }) => void
  isLoading?: boolean
  disabled?: boolean
  titlePrefix: 'create-order' | 'edit-order' | 'view-order'
  isSelectedPrice?: boolean
  isDiscount?: boolean
  isQuantity?: boolean
  includeTotal?: boolean
  isProfit?: boolean
  allowAdd?: boolean
}

export function OrderProductsSection({
  products,
  addProduct,
  removeProduct,
  changeProduct,
  isLoading,
  disabled,
  titlePrefix,
  isSelectedPrice = true,
  isDiscount = true,
  isQuantity = true,
  includeTotal = true,
  isProfit = false,
  allowAdd = true,
}: OrderProductsSectionProps) {
  const { t } = useLocale()
  const [catalogOpen, setCatalogOpen] = useState(false)

  return (
    <div className="space-y-3 rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2">
        <Package className="size-5 shrink-0" />
        <p className="text-lg font-bold">{t(`page.${titlePrefix}.form.products`)}</p>
        <Separator className="flex-1" />
        {allowAdd && !disabled && (
          <Button
            type="button"
            size="sm"
            variant={catalogOpen ? 'secondary' : 'default'}
            onClick={() => setCatalogOpen(open => !open)}
            disabled={isLoading}
          >
            <Plus className="size-4" />
            {t(`page.${titlePrefix}.form.add-product`)}
          </Button>
        )}
      </div>

      {catalogOpen && allowAdd && !disabled && (
        <ProductTable addProduct={addProduct} />
      )}

      {products.length === 0
        ? (
            allowAdd && !disabled
              ? (
                  <button
                    type="button"
                    className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 py-10 text-center transition-colors hover:border-primary/40 hover:bg-muted/30"
                    onClick={() => setCatalogOpen(true)}
                    disabled={isLoading}
                  >
                    <ShoppingCart className="size-8 text-muted-foreground/50" />
                    <p className="text-sm font-medium text-muted-foreground">
                      {t(`page.${titlePrefix}.form.products-empty`)}
                    </p>
                    <span className="inline-flex items-center gap-1 text-sm text-primary">
                      <Plus className="size-3.5" />
                      {t(`page.${titlePrefix}.form.add-product`)}
                    </span>
                  </button>
                )
              : (
                  <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 py-10 text-center">
                    <ShoppingCart className="size-8 text-muted-foreground/50" />
                    <p className="text-sm font-medium text-muted-foreground">
                      {t(`page.${titlePrefix}.form.products-empty`)}
                    </p>
                  </div>
                )
          )
        : (
            <ProductSelectedTable
              products={products}
              removeProduct={removeProduct}
              changeProduct={changeProduct}
              isLoading={isLoading}
              disabled={disabled}
              isReceiving={false}
              isSelectedPrice={isSelectedPrice}
              isDiscount={isDiscount}
              isQuantity={isQuantity}
              includeTotal={includeTotal}
              isProfit={isProfit}
              showHeader
              showColumnVisibility
            />
          )}
    </div>
  )
}
