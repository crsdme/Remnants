import type { ColumnSort } from '@tanstack/react-table'
import { flexRender, getCoreRowModel, getExpandedRowModel, useReactTable } from '@tanstack/react-table'
import { Package } from 'lucide-react'
import { Fragment, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ColumnVisibilityMenu, TablePagination } from '@/components'
import { Skeleton, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui'

import { useDebounceCallback } from '@/utils/hooks'
import { cn } from '@/utils/lib/utils'
import { useColumns } from './columns'

interface ProductSelectedTableProps {
  products: any[]
  productsCount: number
  changeProduct: (options: { productId: string, field: string, value: any }) => void
  isLoading?: boolean
  className?: string
  pagination: {
    current: number
    pageSize: number
  }
  changePagination: (pagination: { current: number, pageSize: number }) => void
}

export function ProductSelectedTable(
  {
    products,
    productsCount,
    isLoading = false,
    className,
    pagination,
    changePagination,
    changeProduct,
  }: ProductSelectedTableProps,
) {
  const { t } = useTranslation()

  const [columnVisibility, setColumnVisibility] = useState({})
  const [sorting, setSorting] = useState<ColumnSort[]>([])

  const debouncedUpdate = useDebounceCallback(({ productId, field, value }) => {
    changeProduct?.({ productId, field, value })
  }, 500)

  function handleChange({ productId, field, value, isDebounced = false }: { productId: string, field: string, value: number, isDebounced?: boolean }) {
    if (isDebounced) {
      debouncedUpdate({ productId, field, value })
    }
    else {
      changeProduct?.({ productId, field, value })
    }
  }

  const columns = useColumns({
    handleChange,
    disabled: false,
  })

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    getExpandedRowModel: getExpandedRowModel(),
    onSortingChange: setSorting,
    enableSortingRemoval: true,
    state: {
      sorting,
      columnVisibility,
    },
  })

  const renderTableHeader = () => {
    return table.getHeaderGroups().map(headerGroup => (
      <TableRow key={headerGroup.id}>
        {headerGroup.headers.map((header) => {
          return (
            <TableHead
              key={header.id}
              className={`max-w-[${header.column.columnDef.size}px]`}
            >
              {flexRender(header.column.columnDef.header, header.getContext())}
            </TableHead>
          )
        })}
      </TableRow>
    ))
  }

  const renderSkeletonRows = () => {
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

  const renderRow = row => (
    <Fragment key={row.id}>
      <TableRow
        data-state={row.getIsSelected() && 'selected'}
      >
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

  const renderTableBody = () => {
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

  return (
    <div className={cn('', className)}>
      <div className="flex justify-between items-center max-md:flex-col gap-2 py-2">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Package className="size-5" />
          <p className="text-lg font-medium">{t('component.productTable.table.selectedProducts', { count: products.reduce((acc, product) => acc + product.quantity, 0) })}</p>
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
        </Table>
      </div>
      <TablePagination
        pagination={pagination}
        totalPages={Math.ceil(productsCount / pagination.pageSize)}
        changePagination={changePagination}
        totalCount={productsCount}
      />
    </div>
  )
}
