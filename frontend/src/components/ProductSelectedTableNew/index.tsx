import type { ColumnDef, ColumnSort } from '@tanstack/react-table'
import { flexRender, getCoreRowModel, getExpandedRowModel, useReactTable } from '@tanstack/react-table'
import { Package } from 'lucide-react'
import { Fragment, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ColumnVisibilityMenu } from '@/components'
import { Skeleton, Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui'
import { useDebounceCallback } from '@/utils/hooks'
import { cn } from '@/utils/lib/utils'

export interface BaseProductRow {
  id: string
  quantity: number
}

interface ProductSelectedTableProps<TData extends BaseProductRow> {
  products: TData[]
  columns: ColumnDef<TData, any>[]

  onChangeField?: (options: { productId: string, field: string, value: any, isDebounced?: boolean }) => void
  onRemoveRow?: (row: TData) => void

  isLoading?: boolean
  disabled?: boolean
  className?: string

  includeFooterTotal?: boolean
  footerTotalSlot?: React.ReactNode
}

export function ProductSelectedTableNew<TData extends BaseProductRow>({
  products,
  columns,
  isLoading = false,
  className,
  onChangeField,
  onRemoveRow,
  includeFooterTotal = false,
  footerTotalSlot,
  disabled = false,
}: ProductSelectedTableProps<TData>) {
  const { t } = useTranslation()

  const [columnVisibility, setColumnVisibility] = useState({})
  const [sorting, setSorting] = useState<ColumnSort[]>([])

  const debouncedUpdate = useDebounceCallback(({ productId, field, value }) => {
    onChangeField?.({ productId, field, value })
  }, 500)

  function handleChange({ productId, field, value, isDebounced = false }: { productId: string, field: string, value: any, isDebounced?: boolean }) {
    if (isDebounced) {
      debouncedUpdate({ productId, field, value })
    }
    else {
      onChangeField?.({ productId, field, value })
    }
  }

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    getExpandedRowModel: getExpandedRowModel(),
    onSortingChange: setSorting,
    enableSortingRemoval: true,
    meta: {
      tableDisabled: disabled,
      handleChange,
      onRemoveRow,
    },
    state: {
      sorting,
      columnVisibility,
    },
  })

  function renderTableHeader() {
    return table.getHeaderGroups().map(headerGroup => (
      <TableRow key={headerGroup.id}>
        {headerGroup.headers.map(header => (
          <TableHead
            key={header.id}
            className={`max-w-[${header.column.columnDef.size}px]`}
          >
            {flexRender(header.column.columnDef.header, header.getContext())}
          </TableHead>
        ))}
      </TableRow>
    ))
  }

  function renderSkeletonRows() {
    const visibleColumns = table.getVisibleFlatColumns()

    return Array.from({ length: 10 }).map((_, index) => (
      // eslint-disable-next-line react/no-array-index-key
      <TableRow key={`skeleton-${index}`} className="animate-pulse">
        {visibleColumns.map(column => (
          <TableCell key={`skeleton-cell-${column.id}`}>
            <Skeleton className="h-8 w-full" />
          </TableCell>
        ))}
      </TableRow>
    ))
  }

  function renderRow(row) {
    return (
      <Fragment key={row.id}>
        <TableRow data-state={row.getIsSelected() && 'selected'}>
          {row.getVisibleCells().map(cell => (
            <TableCell
              key={cell.id}
              className={`max-w-[${cell.column.columnDef.size}px]`}
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          ))}
        </TableRow>
      </Fragment>
    )
  }

  function renderTableBody() {
    if (isLoading)
      return renderSkeletonRows()

    const rows = table.getRowModel().rows
    if (rows?.length) {
      return rows.map(row => renderRow(row))
    }

    return (
      <TableRow>
        <TableCell colSpan={columns.length} className="h-24 text-center">
          {t('table.noResults')}
        </TableCell>
      </TableRow>
    )
  }

  function renderTableFooter() {
    const footerGroups = table.getFooterGroups()

    const hasContent = footerGroups.some(group =>
      group.headers.some(header => !!header.column.columnDef.footer),
    )

    if (!hasContent)
      return null

    return footerGroups.map(footerGroup => (
      <TableRow key={footerGroup.id}>
        {footerGroup.headers.map(footerHeader => (
          <TableCell
            key={footerHeader.id}
            className={`font-semibold max-w-[${footerHeader.column.columnDef.size}px] text-right align-top`}
          >
            {flexRender(
              footerHeader.column.columnDef.footer,
              footerHeader.getContext(),
            )}
          </TableCell>
        ))}
      </TableRow>
    ))
  }

  return (
    <div className={cn('', className)}>
      <div className="flex justify-between items-center max-md:flex-col gap-2 py-2">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Package className="size-5" />
          <p className="text-lg font-medium">
            {t('component.productTable.table.selectedProducts', {
              count: products.reduce((acc, product) => acc + product.quantity, 0),
            })}
          </p>
        </h3>

        <ColumnVisibilityMenu
          table={table}
          tableId="selected-products-component"
          className="min-w-[100%] sm:min-w-[100px]"
        />
      </div>

      <div className="border rounded-sm">
        <Table>
          <TableHeader>{renderTableHeader()}</TableHeader>
          <TableBody>{renderTableBody()}</TableBody>
          <TableFooter>{renderTableFooter()}</TableFooter>
        </Table>
      </div>

      {includeFooterTotal && footerTotalSlot}
    </div>
  )
}
