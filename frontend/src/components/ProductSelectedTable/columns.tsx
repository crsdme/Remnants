import type { ProductPopulatedDTO } from '@remnant/shared'
import type { Row } from '@tanstack/react-table'
import { createColumnHelper } from '@tanstack/react-table'
import {
  Check,
  Minus,
  Plus,
  Trash2,
  X,
} from 'lucide-react'

import { useMemo } from 'react'
import { useCurrencyQuery, useCurrencySelectOptions, useProductPropertyQuery } from '@/api/hooks'
import { ImageGallery } from '@/components'
import { Badge, Button, Popover, PopoverContent, PopoverTrigger, Separator } from '@/components/ui'
import { useAuthContext } from '@/contexts'
import { formatDate } from '@/utils/helpers'
import { hasPermission } from '@/utils/helpers/permission'
import { useLocale } from '@/utils/hooks'
import { AsyncSelectMenu } from '../AsyncSelectMenu'
import { EditableCell } from './cells'

interface ProductSelectedTableProps {
  removeProduct: (productId: string) => void
  isReceiving: boolean
  isSelectedPrice: boolean
  isDiscount: boolean
  disabled: boolean
  handleChange: (options: { productId: string, field: string, value: string | number | string[], isDebounced?: boolean }) => void
  includeTotal: boolean
  isProfit: boolean
  isQuantity: boolean
  removable: boolean
}
const columnHelper = createColumnHelper<ProductPopulatedDTO & {
  lineQuantity?: number
  profit?: number
  selectedCurrencyId?: string
  manualPrice?: number
  selectedPrice?: number
  basePrice?: number
  discountPercent?: number
  discountAmount?: number
}>()

export function useColumns(
  {
    removeProduct,
    isReceiving,
    isSelectedPrice,
    isDiscount,
    isQuantity,
    disabled,
    handleChange,
    includeTotal,
    isProfit,
    removable,
  }: ProductSelectedTableProps,
) {
  const { t, language } = useLocale()
  const { permissions } = useAuthContext()

  const { productProperties } = useProductPropertyQuery({
    filters: { active: [true], language, showInTable: true },
    pagination: { full: true },
  })

  const isLoading = false

  const { loadSearchOptions, loadSelectedOptions } = useCurrencySelectOptions()

  const { currencies = [] } = useCurrencyQuery({ pagination: { full: true } })

  const columns = useMemo(() => {
    function actionColumn() {
      return columnHelper.display({
        id: 'action',
        size: 85,
        meta: {
          title: t('table.actions'),
        },
        enableHiding: false,
        cell: ({ row }) => {
          if (!removable)
            return null

          return (
            <div className="flex gap-2 justify-end">
              <Button
                onClick={() => removeProduct(row.original.id)}
                variant="ghost"
                size="icon"
                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                disabled={isLoading || disabled}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )
        },
      })
    }

    function productPropertyColumn() {
      return productProperties.map(property => columnHelper.display({
        id: property.id,
        size: 150,
        meta: {
          title: property.names[language],
          filterable: true,
          filterType: 'text',
          sortable: true,
        },
        header: () => property.names[language],
        cell: ({ row }: { row: Row<ProductPopulatedDTO> }) => {
          const productProperty = row.original.productProperties.find(p => p.id === property.id)

          if (!productProperty)
            return null

          switch (productProperty.data.type) {
            case 'text':
              return `${productProperty.value as string} ${productProperty?.data?.symbols?.[language] || ''}`
            case 'number':
              return `${productProperty.value as number} ${productProperty?.data?.symbols?.[language] || ''}`
            case 'boolean':
              return <Badge variant={productProperty.value as boolean ? 'success' : 'destructive'}>{t(`table.yesno.${productProperty.value as boolean}`)}</Badge>
            case 'select':
              return (
                <div className="flex flex-wrap gap-2">
                  {productProperty.options.map(option =>
                    <Badge key={option.id}>{option.names[language]}</Badge>)}
                </div>
              )
            case 'multiSelect':
              return (
                <div className="flex flex-wrap gap-2">
                  {productProperty.options.map(option =>
                    <Badge key={option.id}>{option.names[language]}</Badge>)}
                </div>
              )
            case 'color':
              return (
                <div className="flex flex-wrap gap-2">
                  {productProperty.options.map(option => (
                    <Badge key={option.id}>
                      <div className="w-2 h-2 rounded-full border-gray-200" style={{ backgroundColor: option.color }} />
                      {option.names[language]}
                    </Badge>
                  ))}
                </div>
              )
          }
        },
        footer: ({ table }) => {
          const { rows } = table.getRowModel()

          const values = rows
            .map((r: any) => r.original.productProperties.find((p: any) => p.id === property.id))
            .filter(Boolean)

          if (!values.length)
            return null

          const type = values[0].data.type

          if (type === 'number') {
            let sum = 0
            let unitSymbol: string | undefined

            for (const v of values) {
              const num = typeof v.value === 'number' ? v.value : Number(v.value)
              if (!Number.isNaN(num))
                sum += num

              if (!unitSymbol) {
                unitSymbol = v?.data?.symbols?.[language]
              }
            }

            return (
              <div className="flex flex-wrap gap-2">
                <Badge>{`${sum} ${unitSymbol || ''}`}</Badge>
              </div>
            )
          }

          if (type === 'boolean') {
            let trueCount = 0
            let falseCount = 0

            for (const v of values) {
              if (v.value === true)
                trueCount++
              else if (v.value === false)
                falseCount++
            }

            if (!trueCount && !falseCount)
              return null

            return (
              <div className="flex flex-wrap gap-2 justify-end text-xs leading-tight">
                {trueCount > 0 && (
                  <Badge variant="success">
                    {`${t('table.yesno.true')} ${trueCount}`}
                  </Badge>
                )}
                {falseCount > 0 && (
                  <Badge variant="destructive">
                    {`${t('table.yesno.false')} ${falseCount}`}
                  </Badge>
                )}
              </div>
            )
          }

          if (type === 'select' || type === 'multiSelect' || type === 'color') {
            const optionMap = new Map<
              string,
              { count: number, label: string, color?: string }
            >()

            for (const v of values) {
              for (const opt of v.optionData || []) {
                const prev = optionMap.get(opt.id)
                if (prev) {
                  prev.count += 1
                }
                else {
                  optionMap.set(opt.id, {
                    count: 1,
                    label: opt.names[language],
                    color: opt.color,
                  })
                }
              }
            }

            if (!optionMap.size)
              return null

            return (
              <div className="flex flex-wrap gap-2 justify-end text-xs leading-tight">
                {Array.from(optionMap.entries()).map(([id, { count, label, color }]) => (
                  <Badge key={id} className="flex items-center gap-2">
                    {type === 'color' && (
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    )}
                    <span>{label}</span>
                    <span>{count}</span>
                  </Badge>
                ))}
              </div>
            )
          }

          // fallback
          return null
        },
      }))
    }

    function purchasePriceColumn() {
      if (!hasPermission(permissions, 'product.purchasePrice'))
        return []
      return [
        columnHelper.accessor(
          row => `${row.purchasePrice} ${row.purchaseCurrency?.symbols[language] ?? ''}`,
          {
            id: 'purchasePrice',
            size: 150,
            meta: {
              title: t('component.productTable.table.purchasePrice'),
              filterable: true,
              filterType: 'number',
              sortable: true,
            },
            header: () => t('component.productTable.table.purchasePrice'),
          },
        ),
      ]
    }

    function profitColumns() {
      if (!isProfit)
        return []

      return [
        columnHelper.accessor(
          row => `${row.profit} ${row.selectedCurrencyId || ''}`,
          {
            id: 'profit',
            size: 150,
            meta: {
              title: t('component.productTable.table.profit'),
              filterable: true,
              filterType: 'number',
              sortable: true,
            },
            header: () => t('component.productTable.table.profit'),
            footer: ({ table }) => {
              const { rows } = table.getRowModel()

              const totalsByCurrency = rows.reduce((acc: Record<string, number>, r: Row<any>) => {
                const p = r.original
                const symbol = p?.selectedCurrencyId || p?.currency?.symbols?.[language]

                if (!symbol)
                  return acc

                const rowTotal = (p.lineQuantity ?? 0) * (p.profit ?? 0)

                acc[symbol] = (acc[symbol] ?? 0) + rowTotal
                return acc
              }, {} as Record<string, number>)

              const badges = Object.entries(totalsByCurrency).map(([symbol, sum]) => (
                <Badge key={symbol}>
                  {`${Number(sum).toString()} ${symbol}`}
                </Badge>
              ))

              return badges.length
                ? <div className="flex flex-wrap gap-2">{badges}</div>
                : null
            },
          },
        ),
      ]
    }

    function includeTotalColumn() {
      if (!includeTotal)
        return []

      return [columnHelper.display({
        id: 'total',
        meta: {
          title: t('component.productTable.table.total'),
        },
        cell: ({ row }) => {
          const item = row.original
          const lineQuantity = item.lineQuantity ?? 0
          const selectedPrice = item.selectedPrice ?? 0

          return (
            <div className="flex items-center gap-2">
              <p className="font-bold">
                {`${(lineQuantity * selectedPrice).toFixed(2)} ${currencies.find(c => c.id === item.selectedCurrencyId)?.symbols[language]}`}
              </p>
            </div>
          )
        },
      })]
    }

    function receiveQuantityColumn() {
      if (!isReceiving)
        return []

      return [columnHelper.display({
        id: 'receivedQuantity',
        meta: {
          title: t('component.productTable.table.receivedQuantity'),
          filterable: true,
          filterType: 'number',
          sortable: true,
          defaultVisible: true,
        },
        header: () => t('component.productTable.table.receivedQuantity'),
        cell: ({ row }: { row: Row<any> }) => {
          const product = row.original
          const hasMismatch = product.receivedQuantity !== product.lineQuantity

          return (
            <div className="flex items-center gap-2">
              <Badge variant={hasMismatch ? 'destructive' : 'success'}>
                {hasMismatch ? <X /> : <Check />}
              </Badge>
              <Separator orientation="vertical" className="h-8" />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleChange({ productId: product.product, field: 'receivedQuantity', value: product.receivedQuantity - 1 })}
                  disabled={isLoading || disabled}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="relative min-w-5">
                  {/* <Input
                    placeholder={t('component.product-select-table.quantity.placeholder')}
                    value={product.receivedQuantity}
                    className="pr-10 w-20"
                    disabled={isLoading || disabled}
                    onChange={event => handleChange({
                      productId: product.id,
                      field: 'receivedQuantity',
                      value: Number.parseInt(event.target.value),
                      isDebounced: true,
                    })}
                  /> */}
                  <EditableCell
                    product={product}
                    onChange={value => handleChange({
                      productId: product.product,
                      field: 'receivedQuantity',
                      value,
                      isDebounced: true,
                    })}
                    field="receivedQuantity"
                    className="w-20"
                    disabled={isLoading || disabled}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <p>{product.unit.symbols[language]}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleChange({ productId: product.product, field: 'receivedQuantity', value: product.receivedQuantity + 1 })}
                  disabled={isLoading || disabled}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )
        },
      })]
    }

    function selectedPriceColumn() {
      if (!isSelectedPrice)
        return []

      return [columnHelper.display({
        id: 'selectedPrice',
        meta: {
          title: t('component.productTable.table.selectedPrice'),
          filterable: true,
          filterType: 'number',
          sortable: true,
          defaultVisible: true,
        },
        header: () => t('component.productTable.table.selectedPrice'),
        footer: ({ table }) => {
          const { rows } = table.getRowModel()
          const currencySymbolsById = currencies.reduce((acc: Record<string, string>, currency) => {
            acc[currency.id] = currency.symbols?.[language] || currency.id
            return acc
          }, {})

          const totalsByCurrencyId = rows.reduce((acc: Record<string, number>, r: Row<any>) => {
            const p = r.original
            const currencyId = p?.selectedCurrencyId

            if (!currencyId)
              return acc

            const rowTotal = (p.lineQuantity ?? 0) * (p.selectedPrice ?? 0)
            const key = String(currencyId)

            acc[key] = (acc[key] ?? 0) + rowTotal
            return acc
          }, {} as Record<string, number>)

          const badges = Object.entries(totalsByCurrencyId).map(([currencyId, sum]) => (
            <Badge key={currencyId}>
              {`${Number(sum).toString()} ${currencySymbolsById[currencyId] || currencyId}`}
            </Badge>
          ))

          return badges.length
            ? <div className="flex flex-wrap gap-2">{badges}</div>
            : null
        },
        cell: ({ row }) => {
          const product = row.original
          return (
            <div className="flex gap-2">
              <EditableCell
                product={product}
                onChange={value => handleChange({
                  productId: product.id,
                  field: 'selectedPrice',
                  value,
                  isDebounced: true,
                })}
                field="selectedPrice"
                className="w-20 pr-2"
                disabled={isLoading || disabled}
              />
              <AsyncSelectMenu
                loadSearchOptions={loadSearchOptions}
                loadSelectedOptions={loadSelectedOptions}
                value={product.selectedCurrencyId}
                renderOption={e => `${e.symbols[language]}`}
                getDisplayValue={e => `${e.symbols[language]}`}
                getOptionValue={e => e.id}
                disabled={isLoading || disabled}
                onChange={val => handleChange({
                  productId: product.id,
                  field: 'selectedCurrencyId',
                  value: val,
                })}
                triggerClassName="w-15"
                placeholder="..."
                isForm={false}
              />
            </div>
          )
        },
      })]
    }

    function discountColumns() {
      if (!isDiscount)
        return []

      return [
        columnHelper.display({
          id: 'discount',
          meta: {
            title: t('component.productTable.table.discount'),
            filterable: true,
            filterType: 'number',
            sortable: true,
          },
          header: () => t('component.productTable.table.discount'),
          cell: ({ row }) => {
            const product = row.original
            const currency = currencies.find(c => c.id === product.selectedCurrencyId)?.symbols[language]
            const currentPrice = (product.manualPrice ?? product.basePrice) || 0
            const discountPercent = product.discountPercent || 0
            const discountAmount = product.discountAmount || 0

            let discountPrice = 0
            if (discountPercent > 0) {
              discountPrice = currentPrice - (currentPrice * discountPercent) / 100 - currentPrice
            }
            else if (discountAmount > 0) {
              discountPrice = (currentPrice - discountAmount - currentPrice)
            }

            return (
              <Popover>
                <PopoverTrigger asChild>
                  <div className="flex gap-2 relative">
                    <Button variant="outline" className="w-full justify-start">
                      {discountPrice.toFixed(2)}
                    </Button>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <p>{currency}</p>
                    </div>
                  </div>
                </PopoverTrigger>

                <PopoverContent className="w-30 space-y-3 p-2" onOpenAutoFocus={e => e.preventDefault()}>
                  <div className="flex gap-2 relative min-w-5">
                    <EditableCell
                      product={product}
                      onChange={val => handleChange({
                        productId: product.id,
                        field: 'discountAmount',
                        value: val,
                        isDebounced: true,
                      })}
                      field="discountAmount"
                      className="w-full"
                      disabled={isLoading || disabled}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <p>{currency}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 relative min-w-5">
                    <EditableCell
                      product={product}
                      onChange={val => handleChange({
                        productId: product.id,
                        field: 'discountPercent',
                        value: val,
                        isDebounced: true,
                      })}
                      field="discountPercent"
                      className="w-full"
                      disabled={isLoading || disabled}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <p>%</p>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )
          },
        }),
      ]
    }

    function quantityColumn() {
      if (!isQuantity)
        return []

      return [columnHelper.display({
        id: 'lineQuantity',
        size: 150,
        meta: {
          title: t('component.productTable.table.selectedQuantity'),
          filterable: true,
          filterType: 'number',
          sortable: true,
          defaultVisible: true,
        },
        header: () => t('component.productTable.table.selectedQuantity'),
        footer: ({ table }) => {
          const { rows } = table.getRowModel()

          const totalsByUnit = rows.reduce((acc: Record<string, number>, r: Row<any>) => {
            const p = r.original
            const unit = p?.unit?.symbols?.[language]

            if (!unit)
              return acc

            const rowTotal = (p.lineQuantity ?? 0)

            acc[unit] = (acc[unit] ?? 0) + rowTotal
            return acc
          }, {})

          const badges = Object.entries(totalsByUnit).map(([unit, sum]) => (
            <Badge key={unit}>
              {`${Number(sum).toString()} ${unit}`}
            </Badge>
          ))

          return badges.length
            ? <div className="flex flex-wrap gap-2">{badges}</div>
            : null
        },
        cell: ({ row }) => {
          const item = row.original

          return (
            <div className="flex gap-2">
              {!isReceiving && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleChange({ productId: item.id, field: 'lineQuantity', value: (item.lineQuantity ?? 0) - 1 })}
                  disabled={isLoading || isReceiving || disabled}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              )}
              <div className="relative min-w-5">
                <EditableCell
                  product={item}
                  onChange={val => handleChange({
                    productId: item.id,
                    field: 'lineQuantity',
                    value: val,
                    isDebounced: true,
                  })}
                  field="lineQuantity"
                  className="w-20"
                  disabled={isLoading || isReceiving || disabled}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <p>{item.unit.symbols[language]}</p>
                </div>
              </div>
              {!isReceiving && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleChange({ productId: item.id, field: 'lineQuantity', value: (item.lineQuantity ?? 0) + 1 })}
                  disabled={isLoading || isReceiving || disabled}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>
          )
        },
      })]
    }

    return [
      columnHelper.display({
        id: 'images',
        size: 100,
        meta: {
          title: t('component.productTable.table.images'),
          defaultVisible: true,
        },
        cell: ({ row }) => {
          const images = row.original.images.map((image, index) => ({
            id: index.toString(),
            src: image.path,
            alt: image.name,
          }))
          return (<ImageGallery images={images} size={60} />)
        },
      }),
      columnHelper.accessor(row => row.names?.[language] || row.names?.en, {
        id: 'names',
        size: 150,
        meta: {
          title: t('component.productTable.table.names'),
          filterable: true,
          filterType: 'text',
          sortable: true,
          defaultVisible: true,
        },
        header: () => t('component.productTable.table.names'),
      }),
      columnHelper.accessor(row => `${row.price} ${row.currency.symbols[language]}`, {
        id: 'price',
        size: 150,
        meta: {
          title: t('component.productTable.table.price'),
          filterable: true,
          filterType: 'number',
          sortable: true,
          defaultVisible: true,
        },
        header: () => t('component.productTable.table.price'),
      }),
      ...purchasePriceColumn(),
      ...profitColumns(),
      columnHelper.accessor(row => `${row.unit.names[language]}`, {
        id: 'unit',
        size: 150,
        meta: {
          title: t('component.productTable.table.unit'),
          filterable: true,
          filterType: 'text',
          sortable: true,
        },
        header: () => t('component.productTable.table.unit'),
      }),
      columnHelper.display({
        id: 'categories',
        size: 150,
        meta: {
          title: t('component.productTable.table.categories'),
          filterable: true,
          filterType: 'text',
          sortable: true,
          defaultVisible: true,
        },
        header: () => t('component.productTable.table.categories'),
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            {row.original.categories.map(category => <Badge key={category.id}>{category.names[language]}</Badge>)}
          </div>
        ),
      }),
      columnHelper.accessor(row => `${row.productPropertiesGroup.names[language]}`, {
        id: 'productPropertyGroup',
        size: 150,
        meta: {
          title: t('component.productTable.table.productPropertyGroup'),
          filterable: true,
          filterType: 'text',
          sortable: true,
        },
        header: () => t('component.productTable.table.productPropertyGroup'),
      }),
      ...productPropertyColumn(),
      columnHelper.accessor('createdAt', {
        id: 'createdAt',
        meta: {
          title: t('table.createdAt'),
          filterable: true,
          filterType: 'date',
          sortable: true,
        },
        header: () => t('table.createdAt'),
        cell: ({ row }) => formatDate(row.getValue('createdAt'), 'dd.MM.yyyy HH:mm', language),
      }),
      columnHelper.accessor('updatedAt', {
        id: 'updatedAt',
        meta: {
          title: t('table.updatedAt'),
          filterable: true,
          filterType: 'date',
          sortable: true,
        },
        header: () => t('table.updatedAt'),
        cell: ({ row }) => formatDate(row.getValue('updatedAt'), 'dd.MM.yyyy HH:mm', language),
      }),
      ...discountColumns(),
      ...selectedPriceColumn(),
      ...quantityColumn(),
      ...receiveQuantityColumn(),
      ...includeTotalColumn(),
      actionColumn(),
    ]
  }, [language, productProperties, currencies, t, permissions, isProfit, isDiscount, isSelectedPrice, isReceiving, includeTotal, isLoading, disabled, handleChange, loadSearchOptions, loadSelectedOptions, removeProduct])
  return columns
}
