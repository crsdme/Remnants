import type { ProductPopulatedDTO } from '@remnant/shared'
import type { Row } from '@tanstack/react-table'
import { flexRender, getCoreRowModel, getExpandedRowModel, useReactTable } from '@tanstack/react-table'
import { Fragment, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { useProductQuery } from '@/api/hooks'
import { ColumnVisibilityMenu, TablePagination } from '@/components'
import { Skeleton, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui'

import { useListQueryState } from '@/utils/hooks'
import { useColumns } from './columns'
import { DataTableFilters } from './data-table-filters'

export function ProductTable({ addProduct }: { addProduct: (product: ProductPopulatedDTO) => void }) {
  const { t } = useTranslation()

  const [columnVisibility, setColumnVisibility] = useState({})
  const {
    pagination,
    setPagination,
    sorting,
    setSorting,
    filters,
    setFilters,
    sorters,
  } = useListQueryState({
    readFilters: params => ({
      search: params.get('search'),
    }),
    writeFilters: (params, filters) => {
      params.set('search', filters.search || '')
    },
  })

  const { products = [], productsCount = 0, isLoading, isFetching } = useProductQuery(
    { pagination, filters, sorters },
    { options: { placeholderData: prevData => prevData } },
  )

  const columns = useColumns({ isLoading, addProduct, filters })

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    getExpandedRowModel: getExpandedRowModel(),
    onSortingChange: setSorting,
    manualSorting: true,
    enableSortingRemoval: true,
    state: {
      sorting,
      columnVisibility,
      pagination: {
        pageIndex: pagination.current - 1,
        pageSize: pagination.pageSize,
      },
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

    return Array.from({ length: pagination.pageSize }).map((_, index) => (
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

  const renderRow = (row: Row<ProductPopulatedDTO>) => (
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
    if (isLoading || isFetching)
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
    <div>
      <div className="w-full flex justify-between items-start max-md:flex-col gap-2 py-2">
        <div className="sm:flex-row flex-col flex gap-2 items-center w-full">
          <DataTableFilters filters={filters} setFilters={setFilters} />
          <ColumnVisibilityMenu
            table={table}
            tableId="products-component"
            className="min-w-full sm:min-w-[100px]"
          />
        </div>
      </div>
      <div className="border rounded-sm max-w-full overflow-auto h-[300px] scrollbar-hide">
        <Table>
          <TableHeader>{renderTableHeader()}</TableHeader>
          <TableBody>
            {renderTableBody()}
          </TableBody>
        </Table>
      </div>
      <TablePagination
        pagination={pagination}
        totalPages={Math.ceil(productsCount / pagination.pageSize)}
        changePagination={setPagination}
        selectedCount={0}
        totalCount={productsCount}
      />
    </div>
  )
}
