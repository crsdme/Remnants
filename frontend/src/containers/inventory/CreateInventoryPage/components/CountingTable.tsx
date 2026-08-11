import type { InventoryItemDTO } from '@remnant/shared'
import type { Column, ColumnSort, Row } from '@tanstack/react-table'
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronsUpDown,
  Minus,
  Plus,
  X,
} from 'lucide-react'
import { Fragment, useEffect, useMemo, useState } from 'react'
import { ColumnVisibilityMenu, ImageGallery, TablePagination } from '@/components'
import { Badge, Button, Input, Separator, Skeleton, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui'
import { useLocale } from '@/utils/hooks'
import { cn } from '@/utils/lib/utils'

export type InventoryCountingRow = InventoryItemDTO & {
  lineQuantity: number
  receivedQuantity: number
}

const sortIcons = { asc: ArrowUp, desc: ArrowDown }
const columnHelper = createColumnHelper<InventoryCountingRow>()

interface CountingTableProps {
  items: InventoryItemDTO[]
  itemsCount: number
  isLoading?: boolean
  readOnly?: boolean
  focusedProductId?: string | null
  pagination: { current: number, pageSize: number }
  changePagination: (pagination: { current: number, pageSize: number }) => void
  onQuantityChange?: (productId: string, receivedQuantity: number) => void
}

function QuantityInput({
  value,
  disabled,
  onCommit,
}: {
  value: number
  disabled?: boolean
  onCommit: (value: number) => void
}) {
  const [localValue, setLocalValue] = useState(String(value))

  useEffect(() => {
    setLocalValue(String(value))
  }, [value])

  return (
    <Input
      value={localValue}
      className="w-20 text-center"
      disabled={disabled}
      onChange={(e) => {
        setLocalValue(e.target.value)
      }}
      onBlur={() => {
        const parsed = Number(localValue)
        onCommit(Number.isFinite(parsed) ? parsed : 0)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter')
          e.currentTarget.blur()
      }}
    />
  )
}

function useCountingColumns({
  onQuantityChange,
  disabled,
  readOnly,
}: {
  onQuantityChange?: (productId: string, receivedQuantity: number) => void
  disabled: boolean
  readOnly: boolean
}) {
  const { t, language } = useLocale()

  return useMemo(() => {
    function sortHeader(column: Column<InventoryCountingRow, unknown>, label: string) {
      const sorted = column.getIsSorted()
      const Icon = sorted ? sortIcons[sorted] : ChevronsUpDown

      return (
        <Button
          type="button"
          disabled={disabled}
          variant="ghost"
          onClick={() => column.toggleSorting()}
          className="my-2 flex items-center gap-2"
        >
          {label}
          <Icon className="w-4 h-4" />
        </Button>
      )
    }

    return [
      columnHelper.display({
        id: 'images',
        size: 100,
        meta: {
          title: t('page.create-inventory.table.image'),
          defaultVisible: true,
        },
        header: () => t('page.create-inventory.table.image'),
        cell: ({ row }) => {
          const images = row.original.product?.images ?? []
          if (!images.length)
            return <span className="text-muted-foreground">—</span>

          return (
            <ImageGallery
              size={60}
              images={images.map(image => ({
                id: image.id,
                src: image.path,
                alt: image.name ?? image.filename,
              }))}
            />
          )
        },
      }),
      columnHelper.accessor(row => row.product?.names?.[language] || row.product?.names?.ru || '', {
        id: 'names',
        size: 220,
        meta: {
          title: t('page.create-inventory.table.product'),
          defaultVisible: true,
        },
        header: ({ column }) => sortHeader(column, t('page.create-inventory.table.product')),
        cell: ({ row }) => (
          <p className="font-medium">
            {row.original.product?.names?.[language]
              ?? row.original.product?.names?.ru
              ?? row.original.productId}
          </p>
        ),
      }),
      columnHelper.accessor(row => row.product?.seq ?? 0, {
        id: 'seq',
        size: 80,
        meta: {
          title: t('page.create-inventory.table.seq'),
          defaultVisible: true,
        },
        header: ({ column }) => sortHeader(column, t('page.create-inventory.table.seq')),
        cell: ({ row }) => row.original.product?.seq ?? '—',
      }),
      columnHelper.display({
        id: 'barcodes',
        size: 160,
        meta: {
          title: t('page.create-inventory.table.barcodes'),
          defaultVisible: false,
        },
        header: () => t('page.create-inventory.table.barcodes'),
        cell: ({ row }) => {
          const codes = row.original.product?.barcodes?.map(barcode => barcode.code) ?? []
          return codes.length ? codes.join(', ') : '—'
        },
      }),
      columnHelper.display({
        id: 'stockStatus',
        size: 150,
        meta: {
          title: t('page.create-inventory.table.stockStatus'),
          defaultVisible: true,
        },
        header: () => t('page.create-inventory.table.stockStatus'),
        cell: ({ row }) => {
          const stockStatus = row.original.product?.stockStatus
          if (!stockStatus)
            return <span className="text-muted-foreground">—</span>

          return (
            <Badge
              variant="outline"
              style={{
                borderColor: stockStatus.color,
                color: stockStatus.color,
              }}
            >
              {stockStatus.names[language] || stockStatus.names.en}
            </Badge>
          )
        },
      }),
      columnHelper.accessor('lineQuantity', {
        id: 'lineQuantity',
        size: 120,
        meta: {
          title: t('page.create-inventory.table.book'),
          defaultVisible: true,
        },
        header: ({ column }) => sortHeader(column, t('page.create-inventory.table.book')),
        cell: ({ row }) => (
          <span>
            {row.original.lineQuantity}
            {' '}
            {row.original.product?.unit?.symbols?.[language] ?? ''}
          </span>
        ),
      }),
      columnHelper.display({
        id: 'receivedQuantity',
        size: readOnly ? 120 : 220,
        meta: {
          title: t('page.create-inventory.table.counted'),
          defaultVisible: true,
        },
        header: () => t('page.create-inventory.table.counted'),
        cell: ({ row }) => {
          const item = row.original
          const received = item.receivedQuantity
          const hasMismatch = item.counted && received !== item.lineQuantity

          if (readOnly) {
            return (
              <div className="flex items-center gap-2">
                <Badge variant={!item.counted ? 'outline' : hasMismatch ? 'destructive' : 'success'}>
                  {!item.counted ? '—' : hasMismatch ? <X className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                </Badge>
                <span>
                  {item.counted ? received : '—'}
                  {' '}
                  {row.original.product?.unit?.symbols?.[language] ?? ''}
                </span>
              </div>
            )
          }

          const unitSymbol = item.product?.unit?.symbols?.[language] ?? ''

          return (
            <div className="flex items-center gap-2 justify-end">
              <Badge variant={!item.counted ? 'outline' : hasMismatch ? 'destructive' : 'success'}>
                {!item.counted ? '—' : hasMismatch ? <X className="h-3 w-3" /> : <Check className="h-3 w-3" />}
              </Badge>
              <Separator orientation="vertical" className="h-8" />
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={disabled || !onQuantityChange}
                onClick={() => onQuantityChange?.(item.productId, Math.max(received - 1, 0))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <QuantityInput
                value={received}
                disabled={disabled || !onQuantityChange}
                onCommit={value => onQuantityChange?.(item.productId, Math.max(value, 0))}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={disabled || !onQuantityChange}
                onClick={() => onQuantityChange?.(item.productId, received + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
              {unitSymbol ? <span className="text-muted-foreground min-w-8">{unitSymbol}</span> : null}
            </div>
          )
        },
      }),
      columnHelper.display({
        id: 'status',
        size: 140,
        meta: {
          title: t('page.create-inventory.table.status'),
          defaultVisible: true,
        },
        header: () => t('page.create-inventory.table.status'),
        cell: ({ row }) => {
          const item = row.original
          const hasMismatch = item.counted && item.receivedQuantity !== item.lineQuantity

          if (!item.counted)
            return <Badge variant="outline">{t('page.create-inventory.filter.uncounted')}</Badge>
          if (hasMismatch)
            return <Badge variant="destructive">{t('page.create-inventory.filter.mismatch')}</Badge>
          return <Badge variant="success">{t('page.create-inventory.filter.match')}</Badge>
        },
      }),
    ]
  }, [disabled, language, onQuantityChange, readOnly, t])
}

export function CountingTable({
  items,
  itemsCount,
  isLoading = false,
  readOnly = false,
  focusedProductId = null,
  pagination,
  changePagination,
  onQuantityChange,
}: CountingTableProps) {
  const { t } = useLocale()
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({})
  const [sorting, setSorting] = useState<ColumnSort[]>([])

  const rows = useMemo<InventoryCountingRow[]>(() => {
    return items.map(item => ({
      ...item,
      lineQuantity: item.quantity,
      receivedQuantity: item.counted ? (item.receivedQuantity ?? 0) : 0,
    }))
  }, [items])

  const columns = useCountingColumns({
    onQuantityChange,
    disabled: isLoading || readOnly,
    readOnly,
  })

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: setSorting,
    enableSortingRemoval: true,
    state: {
      sorting,
      columnVisibility,
    },
  })

  const renderRow = (row: Row<InventoryCountingRow>) => (
    <Fragment key={row.id}>
      <TableRow className={cn(row.original.productId === focusedProductId && 'bg-yellow-50')}>
        {row.getVisibleCells().map(cell => (
          <TableCell key={cell.id}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
    </Fragment>
  )

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <ColumnVisibilityMenu
          table={table}
          tableId="inventory-counting-table"
          className="min-w-[100px]"
        />
      </div>
      <div className="border rounded-sm overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 8 }).map((_, index) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <TableRow key={`skeleton-${index}`}>
                    {table.getVisibleFlatColumns().map(column => (
                      <TableCell key={`skeleton-cell-${column.id}`}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : table.getRowModel().rows.length
                ? table.getRowModel().rows.map(renderRow)
                : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                        {t('table.noResults')}
                      </TableCell>
                    </TableRow>
                  )}
          </TableBody>
        </Table>
      </div>
      <TablePagination
        pagination={pagination}
        totalPages={Math.max(1, Math.ceil(itemsCount / pagination.pageSize))}
        changePagination={changePagination}
        totalCount={itemsCount}
      />
    </div>
  )
}
