import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useState } from 'react'

import { useOrderQuery, useOrderStatusQuery } from '@/api/hooks'
import { ColumnVisibilityMenu, TablePagination, TableSelectionDropdown } from '@/components'
import { Skeleton, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Tabs, TabsList, TabsTrigger } from '@/components/ui'
import { useThemeContext } from '@/contexts'
import { hexToRgba } from '@/utils/helpers'
import { parseQueryCsv, setQueryParamCsv, useListQueryState, useLocale } from '@/utils/hooks'

import { useColumns } from './columns'
import { DataTableFilters } from './data-table-filters'

export function DataTable() {
  const { t, language } = useLocale()
  const { theme } = useThemeContext()

  const [columnVisibility, setColumnVisibility] = useState({})
  const [rowSelection, setRowSelection] = useState({})
  const {
    pagination,
    setPagination,
    sorting,
    setSorting,
    filters,
    setFilters,
    sorters,
  } = useListQueryState({
    defaults: { filters: { orderStatus: ['all'] } },
    readFilters: params => ({
      orderStatus: parseQueryCsv(params.get('orderStatus')),
    }),
    writeFilters: (params, filters) => {
      setQueryParamCsv(params, 'orderStatus', filters.orderStatus ?? [])
    },
  })
  const columns = useColumns()

  const { orders = [], ordersCount = 0, isLoading, isFetching } = useOrderQuery(
    { pagination, filters, sorters },
    { options: { placeholderData: prevData => prevData } },
  )

  const { orderStatuses = [] } = useOrderStatusQuery(
    { filters: { includeAll: true, includeCount: true } },
    { options: { placeholderData: prevData => prevData } },
  )

  const table = useReactTable({
    data: orders,
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
      return table.getRowModel().rows.map((row) => {
        const color = hexToRgba(row.original.orderStatus?.color || 'transparent', theme.layoutTheme === 'dark' ? 0.22 : 0.1)
        return (
          <TableRow
            data-state={row.getIsSelected() && 'selected'}
            style={{ backgroundColor: color, transition: 'background-color 0.3s ease' }}
            key={row.id}
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
        )
      },
      )
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
    <>
      <div className="w-full flex justify-between items-start max-md:flex-col gap-2 py-2">
        <div className="flex flex-wrap gap-2 items-center">
          <DataTableFilters filters={filters} setFilters={setFilters} />
        </div>
        <div className="flex gap-2">
          <TableSelectionDropdown
            selectedCount={Object.keys(rowSelection).length}
          />
          <ColumnVisibilityMenu table={table} tableId="order" />
        </div>
      </div>
      <div className="w-full flex items-start max-md:flex-col gap-2 py-2">
        <Tabs defaultValue="all" className="flex flex-wrap" value={filters.orderStatus?.[0] || 'all'}>
          <TabsList className="flex flex-wrap">
            {orderStatuses.map(status => (
              <TabsTrigger
                key={status.id}
                value={status.id}
                onClick={() => setFilters({ ...filters, orderStatus: [status.id] })}
              >
                {`${status?.names?.[language] || t('order-status.all')} ${status.ordersCount || 0}`}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <div className="border rounded-sm">
        <Table>
          <TableHeader>{renderTableHeader()}</TableHeader>
          <TableBody>{renderTableBody()}</TableBody>
        </Table>
      </div>
      <TablePagination
        pagination={pagination}
        totalPages={Math.ceil(ordersCount / pagination.pageSize)}
        changePagination={setPagination}
        selectedCount={Object.keys(rowSelection).length}
        totalCount={ordersCount}
      />
    </>
  )
}
