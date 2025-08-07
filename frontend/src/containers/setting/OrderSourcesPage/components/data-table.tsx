import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { Fragment, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useOrderSourceQuery } from '@/api/hooks'
import { AdvancedFilters, AdvancedSorters, ColumnVisibilityMenu, TablePagination, TableSelectionDropdown } from '@/components'
import { Separator, Skeleton, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui'
import { useOrderSourceContext } from '@/contexts'
import { useDebounceCallback } from '@/utils/hooks'

import { useColumns } from './columns'
import { DataTableFilters } from './data-table-filters'

export function DataTable() {
  const { t, i18n } = useTranslation()
  const { removeOrderSource } = useOrderSourceContext()

  const filtersInitialState = {
    names: '',
    color: '',
    priority: undefined,
    createdAt: { from: undefined, to: undefined },
    language: i18n.language,
  }

  const [columnVisibility, setColumnVisibility] = useState({})
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  })
  const [filters, setFilters] = useState(filtersInitialState)
  const columns = useColumns()

  const sorters = useMemo(() => (
    Object.fromEntries(sorting.map(({ id, desc }) => [id, desc ? 'desc' : 'asc']))
  ), [sorting])

  const { data: { orderSources = [], orderSourcesCount = 0 } = {}, isLoading, isFetching } = useOrderSourceQuery(
    { pagination, filters, sorters },
    { options: {
      select: response => ({
        orderSources: response.data.orderSources,
        orderSourcesCount: response.data.orderSourcesCount,
      }),
      placeholderData: prevData => prevData,
    } },
  )

  const table = useReactTable({
    data: orderSources,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    manualSorting: true,
    enableSortingRemoval: true,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
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

  const renderTableBody = () => {
    if (isLoading || isFetching)
      return renderSkeletonRows()

    if (table.getRowModel().rows?.length) {
      return table.getRowModel().rows.map(row => (
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
      ))
    }

    return (
      <TableRow>
        <TableCell colSpan={columns.length} className="h-24 text-center">
          {t('table.noResults')}
        </TableCell>
      </TableRow>
    )
  }

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

  const handleBulkRemove = () => {
    const ids = orderSources.filter((_, index) => rowSelection[index]).map(item => item.id)
    removeOrderSource({ ids })
    setRowSelection({})
  }

  const changePagination = useDebounceCallback((value: Pagination) => {
    setPagination(state => ({ ...state, ...value }))
  }, 50)

  const advancedSortersSubmit = (sorters) => {
    const mapedSorters = sorters.map(({ column, value }) => ({
      id: column,
      desc: value === 'desc',
    }))

    setSorting(mapedSorters)
  }

  const advancedSortersCancel = () => {
    setSorting([])
  }

  return (
    <>
      <div className="w-full flex justify-between items-start max-md:flex-col gap-2 py-2">
        <div className="flex flex-wrap gap-2 items-center">
          <AdvancedFilters
            columns={columns}
            onSubmit={advancedFiltersSubmit}
            onCancel={advancedFiltersCancel}
          />
          <AdvancedSorters
            columns={columns}
            onSubmit={advancedSortersSubmit}
            onCancel={advancedSortersCancel}
          />
          <Separator orientation="vertical" className="min-h-6 max-md:hidden" />
          <DataTableFilters filters={filters} setFilters={setFilters} />
        </div>
        <div className="flex gap-2">
          <TableSelectionDropdown
            selectedCount={Object.keys(rowSelection).length}
            onRemove={handleBulkRemove}
          />
          <ColumnVisibilityMenu table={table} tableId="order-source" />
        </div>
      </div>
      <div className="border rounded-sm">
        <Table>
          <TableHeader>{renderTableHeader()}</TableHeader>
          <TableBody>{renderTableBody()}</TableBody>
        </Table>
      </div>
      <TablePagination
        pagination={pagination}
        totalPages={Math.ceil(orderSourcesCount / pagination.pageSize)}
        changePagination={changePagination}
        selectedCount={Object.keys(rowSelection).length}
        totalCount={orderSourcesCount}
      />
    </>
  )
}
