import type { ProductPopulatedDTO } from '@remnant/shared'
import { Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { useProductQuery } from '@/api/hooks'
import { Button, Input } from '@/components/ui'
import { useDebounceValue, useLocale } from '@/utils/hooks'
import { cn } from '@/utils/lib/utils'

interface ProductCatalogPickerProps {
  onAdd: (product: ProductPopulatedDTO) => void
  selectedQuantities?: Record<string, number>
  disabled?: boolean
  className?: string
}

export function ProductCatalogPicker({
  onAdd,
  selectedQuantities = {},
  disabled,
  className,
}: ProductCatalogPickerProps) {
  const { t, language } = useLocale()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounceValue(search, 300)

  const { products, isFetching } = useProductQuery(
    {
      filters: {
        search: debouncedSearch || undefined,
        language,
      },
      pagination: { current: 1, pageSize: 20 },
    },
    { options: { placeholderData: prev => prev } },
  )

  return (
    <div className={cn('overflow-hidden rounded-lg border bg-card', className)}>
      <div className="relative border-b p-2">
        <Search className="absolute inset-y-0 left-4 my-auto size-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t('component.productCatalog.search')}
          className="pl-8"
          disabled={disabled}
          autoFocus
        />
      </div>

      <div className="max-h-72 overflow-y-auto">
        {products.length === 0
          ? (
              <p className="px-3 py-6 text-center text-xs text-muted-foreground">
                {isFetching
                  ? t('component.productCatalog.searching')
                  : t('table.noResults')}
              </p>
            )
          : (
              <ul className="divide-y">
                {products.map((product) => {
                  const qty = selectedQuantities[product.id] ?? 0
                  const stock = product.warehouseStock?.reduce((sum, item) => sum + (item.count ?? 0), 0) ?? 0
                  const barcode = product.barcodes?.[0]?.code
                  const category = product.categories?.[0]?.names?.[language]
                  const meta = [
                    barcode,
                    category,
                    t('component.productCatalog.in-stock', { count: stock }),
                  ].filter(Boolean).join('  ')

                  return (
                    <li key={product.id}>
                      <div className="flex items-center gap-3 px-3 py-2.5">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium leading-none">
                            {product.names[language]}
                          </p>
                          {meta && (
                            <p className="mt-1 truncate text-xs text-muted-foreground">
                              {meta}
                            </p>
                          )}
                        </div>
                        <p className="shrink-0 text-sm font-medium tabular-nums">
                          {product.price}
                          {' '}
                          {product.currency.symbols[language]}
                        </p>
                        <Button
                          type="button"
                          size="icon"
                          variant={qty > 0 ? 'secondary' : 'default'}
                          className="size-8 shrink-0"
                          disabled={disabled}
                          onClick={() => onAdd(product)}
                        >
                          {qty > 0
                            ? <span className="text-xs font-semibold">{qty}</span>
                            : <Plus className="size-4" />}
                        </Button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
      </div>
    </div>
  )
}
