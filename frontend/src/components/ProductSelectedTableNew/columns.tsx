import type { ColumnHelper, Table } from '@tanstack/react-table'

import type { AsyncSelectProps } from '../AsyncSelectNew'

import type { BaseProductRow } from './index'

import { Check, Minus, Plus, Trash2, X } from 'lucide-react'

import { ImageGallery } from '@/components'
import { Badge, Button, Separator } from '@/components/ui'

import { AsyncSelectNew } from '../AsyncSelectNew'
import { EditableCell } from './cells'

interface ProductGalleryImage {
  id?: string
  path: string
  name?: string
  filename?: string
  originalname?: string
}

interface ProductTableMeta<TData extends BaseProductRow> {
  tableDisabled?: boolean
  handleChange?: (options: { productId: string, field: string, value: unknown, isDebounced?: boolean }) => void
  onRemoveRow?: (row: TData) => void
}

function tableMeta<TData extends BaseProductRow>(table: Table<TData>): ProductTableMeta<TData> {
  return (table.options.meta ?? {}) as ProductTableMeta<TData>
}

export function makeActionColumn<TData extends BaseProductRow>(
  columnHelper: ColumnHelper<TData>,
  { t }: { t: (key: string) => string },
) {
  return columnHelper.display({
    id: 'action',
    size: 85,
    meta: { title: t('component.productTable.table.actions'), enableHiding: false },
    cell: ({ row, table }) => {
      const { tableDisabled, onRemoveRow } = tableMeta(table)
      const item = row.original

      return (
        <div className="flex gap-2 justify-end">
          <Button
            onClick={() => onRemoveRow?.(item)}
            variant="ghost"
            size="icon"
            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            disabled={tableDisabled}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    },
  })
}

export function makeImagesColumn<TData extends BaseProductRow>(
  columnHelper: ColumnHelper<TData>,
  { t }: { t: (key: string) => string },
) {
  return columnHelper.display({
    id: 'images',
    size: 100,
    meta: {
      title: t('component.productTable.table.images'),
      defaultVisible: true,
    },
    cell: ({ row }) => {
      const { images } = row.original as unknown as { images: ProductGalleryImage[] }
      const galleryImages = images.map((image: ProductGalleryImage, index: number) => ({
        id: String(image.id ?? index),
        src: image.path,
        alt: image.name ?? image.filename ?? image.originalname ?? '',
      }))
      return (<ImageGallery images={galleryImages} size={60} />)
    },
  })
}

export function makeNameColumn<TData extends BaseProductRow>(
  columnHelper: ColumnHelper<TData>,
  { t, language }: { t: (key: string) => string, language: string },
) {
  return columnHelper.accessor(
    (row) => {
      const r = row as { names?: Partial<Record<string, string>> }
      return r.names?.[language] || r.names?.en || ''
    },
    {
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
    },
  )
}

export function makePurchasePriceColumn<TData extends BaseProductRow>(
  columnHelper: ColumnHelper<TData>,
  {
    t,
    language,
    field = 'purchasePrice',
    currencyField = 'purchaseCurrency',
  }: {
    t: (key: string) => string
    language: string
    field?: string
    currencyField?: string
  },
) {
  return columnHelper.accessor(
    (row) => {
      const r = row as Record<string, { symbols?: Partial<Record<string, string>> } | unknown>
      const amount = r[field]
      const cur = r[currencyField] as { symbols: Partial<Record<string, string>> }
      return `${String(amount)} ${cur.symbols[language] ?? ''}`
    },
    {
      id: field,
      size: 150,
      meta: {
        title: t(`component.productTable.table.${field}`),
        filterable: true,
        filterType: 'number',
        sortable: true,
      },
      header: () => t(`component.productTable.table.${field}`),
    },
  )
}

export function makeProfitColumn<TData extends BaseProductRow>(
  columnHelper: ColumnHelper<TData>,
  { t, language }: { t: (key: string) => string, language: string },
) {
  return columnHelper.accessor(
    (row) => {
      const r = row as unknown as {
        profit?: number
        selectedCurrencyId: string
      }
      return `${r.profit ?? ''} ${r.selectedCurrencyId ?? ''}`
    },
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
        const totalsByCurrency = rows.reduce((acc, r) => {
          const p = r.original as {
            quantity?: number
            profit?: number
            selectedCurrencyId?: string
            currency?: { symbols?: Partial<Record<string, string>> }
          }
          const symbol = p?.selectedCurrencyId || p?.currency?.symbols?.[language]
          if (!symbol)
            return acc
          const rowTotal = (p.quantity ?? 0) * (p.profit ?? 0)
          acc[symbol] = (acc[symbol] ?? 0) + rowTotal
          return acc
        }, {} as Record<string, number>)

        return (
          <div className="flex flex-wrap gap-2">
            {Object.entries(totalsByCurrency).map(([symbol, sum]) => (
              <Badge key={symbol}>{`${sum.toString()} ${symbol}`}</Badge>
            ))}
          </div>
        )
      },
    },
  )
}

interface CurrencySelectOption {
  id: string
  symbols: Partial<Record<string, string>>
}

export function makeSelectedPriceColumn<TData extends BaseProductRow>(
  columnHelper: ColumnHelper<TData>,
  {
    t,
    language,
    currencies,
    loadCurrencyOptions,
    field = 'selectedPrice',
    currencyField = 'selectedCurrencyId',
  }: {
    t: (key: string) => string
    language: string
    currencies: CurrencySelectOption[]
    loadCurrencyOptions: AsyncSelectProps<CurrencySelectOption>['loadOptions']
    field?: string
    currencyField?: string
  },
) {
  return columnHelper.display({
    id: field,
    meta: {
      title: t(`component.productTable.table.${field}`),
      filterable: true,
      filterType: 'number',
      sortable: true,
    },
    header: () => t(`component.productTable.table.${field}`),
    footer: ({ table }) => {
      const { rows } = table.getRowModel()

      const totalsByCurrency = rows.reduce((acc: Record<string, number>, r) => {
        const p = r.original as Record<string, unknown> & { quantity?: number }
        const currency = p[currencyField] as { symbols?: Partial<Record<string, string>> } | undefined
        const symbol = currency?.symbols?.[language]

        if (!symbol)
          return acc

        const rowTotal = (p.quantity ?? 0) * Number(p[field] ?? 0)

        acc[symbol] = (acc[symbol] ?? 0) + rowTotal
        return acc
      }, {})

      const badges = Object.entries(totalsByCurrency).map(([symbol, sum]) => (
        <Badge key={symbol}>
          {`${sum.toString()} ${symbol}`}
        </Badge>
      ))

      return badges.length
        ? <div className="flex flex-wrap gap-2">{badges}</div>
        : null
    },
    cell: ({ row, table }) => {
      const { handleChange, tableDisabled } = tableMeta(table)

      const product = row.original as Record<string, unknown> & { id: string }
      const currency = product[currencyField] as { id: string, symbols: Partial<Record<string, string>> }

      return (
        <div className="flex gap-2">
          <EditableCell
            product={product}
            onChange={value => handleChange?.({
              productId: product.id,
              field,
              value,
              isDebounced: true,
            })}
            field={field}
            className="w-20 pr-2"
            disabled={tableDisabled}
          />
          <AsyncSelectNew
            loadOptions={loadCurrencyOptions}
            value={[currency.id]}
            renderOption={(e: CurrencySelectOption) => `${e.symbols[language] ?? ''}`}
            getDisplayValue={(e: CurrencySelectOption) => `${e.symbols[language] ?? ''}`}
            getOptionValue={(e: CurrencySelectOption) => e.id}
            disabled={tableDisabled}
            onChange={val => handleChange?.({
              productId: product.id,
              field: currencyField,
              value: currencies.find(c => c.id === val),
            })}
            triggerClassName="w-15"
            placeholder="..."
            isForm={false}
          />
        </div>
      )
    },
  })
}

export function makeQuantityColumn<TData extends BaseProductRow>(
  columnHelper: ColumnHelper<TData>,
  { t, language, field = 'quantity', received = false }: {
    t: (key: string) => string
    language: string
    field?: string
    received?: boolean
  },
) {
  if (received) {
    return columnHelper.display({
      id: 'receivedQuantity',
      meta: {
        title: t('component.productTable.table.receivedQuantity'),
        filterable: true,
        filterType: 'number',
        sortable: true,
      },
      header: () => t('component.productTable.table.receivedQuantity'),
      cell: ({ row, table }) => {
        const { handleChange, tableDisabled } = tableMeta(table)
        const product = row.original as unknown as BaseProductRow & {
          receivedQuantity: number
          unit: { symbols: Partial<Record<string, string>> }
        }
        const hasMismatch = product.receivedQuantity !== product.quantity

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
                onClick={() =>
                  handleChange?.({
                    productId: product.id,
                    field: 'receivedQuantity',
                    value: product.receivedQuantity - 1,
                  })}
                disabled={tableDisabled}
              >
                <Minus className="h-4 w-4" />
              </Button>

              <div className="relative min-w-5">
                <EditableCell
                  product={product}
                  onChange={value =>
                    handleChange?.({
                      productId: product.id,
                      field: 'receivedQuantity',
                      value,
                      isDebounced: true,
                    })}
                  field="receivedQuantity"
                  className="w-20"
                  disabled={tableDisabled}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <p>{product.unit.symbols[language]}</p>
                </div>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  handleChange?.({
                    productId: product.id,
                    field: 'receivedQuantity',
                    value: product.receivedQuantity + 1,
                  })}
                disabled={tableDisabled}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )
      },
    })
  }

  return columnHelper.display({
    id: field,
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
      const totalsByUnit = rows.reduce((acc, r) => {
        const p = r.original as BaseProductRow & { unit?: { symbols?: Partial<Record<string, string>> } }
        const unit = p?.unit?.symbols?.[language]
        if (!unit)
          return acc
        const rowTotal = (p.quantity ?? 0)
        acc[unit] = (acc[unit] ?? 0) + rowTotal
        return acc
      }, {} as Record<string, number>)

      return (
        <div className="flex flex-wrap gap-2">
          {Object.entries(totalsByUnit).map(([unit, sum]) => (
            <Badge key={unit}>{`${sum.toString()} ${unit}`}</Badge>
          ))}
        </div>
      )
    },
    cell: ({ row, table }) => {
      const { handleChange, tableDisabled } = tableMeta(table)
      const item = row.original as unknown as BaseProductRow & { unit: { symbols: Partial<Record<string, string>> } }

      return (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              handleChange?.({
                productId: item.id,
                field: 'quantity',
                value: item.quantity - 1,
              })}
            disabled={tableDisabled}
          >
            <Minus className="h-4 w-4" />
          </Button>

          <div className="relative min-w-5">
            <EditableCell
              product={item}
              onChange={val =>
                handleChange?.({
                  productId: item.id,
                  field: 'quantity',
                  value: val,
                  isDebounced: true,
                })}
              field="quantity"
              className="w-20"
              disabled={tableDisabled}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <p>{item.unit.symbols[language]}</p>
            </div>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              handleChange?.({
                productId: item.id,
                field: 'quantity',
                value: item.quantity + 1,
              })}
            disabled={tableDisabled}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )
    },
  })
}
