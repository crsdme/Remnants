import type { ColumnSort } from '@tanstack/react-table'
import { flexRender, getCoreRowModel, getExpandedRowModel, useReactTable } from '@tanstack/react-table'
import { Fragment, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useRequestProducts } from '@/api/hooks'
import { AdvancedFilters, ColumnVisibilityMenu, TablePagination } from '@/components'
import { Skeleton, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui'
import { useDebounceCallback } from '@/utils/hooks'

import { useColumns } from './columns'
import { DataTableFilters } from './data-table-filters'

export function ProductTable({ addProduct }: { addProduct: (product: any) => void }) {
  const { t, i18n } = useTranslation()

  const filtersInitialState = {
    names: '',
    symbols: '',
    priority: undefined,
    active: [],
    createdAt: { from: undefined, to: undefined },
    language: i18n.language,
  }

  const [columnVisibility, setColumnVisibility] = useState({})
  const [sorting, setSorting] = useState<ColumnSort[]>([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  })
  const [filters, setFilters] = useState(filtersInitialState)

  const sorters = useMemo(() => (
    Object.fromEntries(sorting.map(({ id, desc }) => [id, desc ? 'desc' : 'asc']))
  ), [sorting])

  const requestProducts = useRequestProducts(
    { pagination, filters, sorters, isTree: true },
    { options: { placeholderData: prevData => prevData } },
  )
  const products = requestProducts?.data?.data?.products || []
  const productsCount = requestProducts?.data?.data?.productsCount || 0

  const columns = useColumns({ isLoading: requestProducts.isLoading, addProduct })

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
    if (requestProducts.isLoading || requestProducts.isFetching)
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

  const changePagination = useDebounceCallback((value: Pagination) => {
    setPagination(state => ({ ...state, ...value }))
  }, 50)

  const advancedFiltersSubmit = (filters) => {
    const filterValues = Object.fromEntries(filters.map(({ column, value }) => [column, value]))
    setFilters(state => ({
      ...state,
      ...filterValues,
    }))
  }

  const advancedFiltersCancel = () => {
    setFilters(filtersInitialState)
  }

  return (
    <div>
      <div className="w-full flex justify-between items-start max-md:flex-col gap-2 py-2">
        <div className="flex gap-2 items-center w-full">
          <DataTableFilters filters={filters} setFilters={setFilters} />
          <AdvancedFilters
            columns={columns}
            onSubmit={advancedFiltersSubmit}
            onCancel={advancedFiltersCancel}
          />
          <ColumnVisibilityMenu table={table} tableId="select-products-component" />
        </div>
      </div>
      <div className="border rounded-sm overflow-y-auto max-h-[300px] scrollbar-hide">
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
        changePagination={changePagination}
        selectedCount={0}
        totalCount={productsCount}
      />
    </div>
  )
}
