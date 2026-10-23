import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useState } from 'react'

import { useOrderQuery, useOrderStatusQuery } from '@/api/hooks'
import { AdvancedFilters, ColumnVisibilityMenu, TablePagination, TableSelectionDropdown } from '@/components'
import { Separator, Skeleton, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Tabs, TabsList, TabsTrigger } from '@/components/ui'
import { useThemeContext } from '@/contexts'
import { hexToRgba } from '@/utils/helpers'
import {
  parseQueryCsv,
  parseQueryDate,
  setQueryParam,
  setQueryParamCsv,
  useListQueryState,
  useLocale,
} from '@/utils/hooks'

import { useColumns } from './columns'
import { DataTableFilters } from './data-table-filters'

interface DateRangeFilter {
  from?: Date
  to?: Date
}

interface OrderListFilters extends Record<string, unknown> {
  orderStatus?: string[]
  search?: string
  seq?: string
  warehouse?: string
  deliveryService?: string
  orderSource?: string
  client?: string
  createdAt?: DateRangeFilter
  updatedAt?: DateRangeFilter
}

function readDateRange(from?: string, to?: string): DateRangeFilter | undefined {
  const fromDate = parseQueryDate(from)
  const toDate = parseQueryDate(to)
  if (!fromDate || !toDate)
    return undefined
  return { from: fromDate, to: toDate }
}

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
  } = useListQueryState<OrderListFilters>({
    defaults: { filters: { orderStatus: ['all'] } },
    readFilters: (params) => {
      const orderStatus = parseQueryCsv(params.get('orderStatus'))
      return {
        ...(orderStatus.length ? { orderStatus } : {}),
        search: params.get('search'),
        seq: params.get('seq'),
        warehouse: params.get('warehouse'),
        deliveryService: params.get('deliveryService'),
        orderSource: params.get('orderSource'),
        client: params.get('client'),
        createdAt: readDateRange(params.get('createdAtFrom'), params.get('createdAtTo')),
        updatedAt: readDateRange(params.get('updatedAtFrom'), params.get('updatedAtTo')),
      }
    },
    writeFilters: (params, next) => {
      setQueryParamCsv(params, 'orderStatus', next.orderStatus ?? [])
      setQueryParam(params, 'search', next.search ?? '')
      setQueryParam(params, 'seq', next.seq ?? '')
      setQueryParam(params, 'warehouse', next.warehouse ?? '')
      setQueryParam(params, 'deliveryService', next.deliveryService ?? '')
      setQueryParam(params, 'orderSource', next.orderSource ?? '')
      setQueryParam(params, 'client', next.client ?? '')
      setQueryParam(params, 'createdAtFrom', next.createdAt?.from?.toISOString() ?? null)
      setQueryParam(params, 'createdAtTo', next.createdAt?.to?.toISOString() ?? null)
      setQueryParam(params, 'updatedAtFrom', next.updatedAt?.from?.toISOString() ?? null)
      setQueryParam(params, 'updatedAtTo', next.updatedAt?.to?.toISOString() ?? null)
    },
  })
  const columns = useColumns()

  const selectedOrderStatus = filters.orderStatus?.[0] || 'all'
  const orderFilters = {
    ...filters,
    orderStatus: selectedOrderStatus === 'all' ? [] : filters.orderStatus,
  }

  const { orders = [], ordersCount = 0, isLoading, isFetching } = useOrderQuery(
    { pagination, filters: orderFilters, sorters },
    { options: { placeholderData: prevData => prevData } },
  )

  const { orderStatuses = [] } = useOrderStatusQuery(
    { filters: { includeCount: true }, pagination: { full: true } },
    { options: { placeholderData: prevData => prevData } },
  )

  const displayedOrderStatuses = orderStatuses.filter(status => status.isDisplayed !== false)
  const allOrdersCount = orderStatuses.reduce((acc, status) => acc + (status.ordersCount || 0), 0)

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

  const advancedFiltersSubmit = (items: { column: string, value: unknown }[]) => {
    setFilters({
      warehouse: '',
      deliveryService: '',
      orderSource: '',
      client: '',
      createdAt: undefined,
      updatedAt: undefined,
      ...Object.fromEntries(items.map(({ column, value }) => [column, value])),
    })
  }

  const advancedFiltersCancel = () => {
    setFilters({
      search: '',
      seq: '',
      warehouse: '',
      deliveryService: '',
      orderSource: '',
      client: '',
      createdAt: undefined,
      updatedAt: undefined,
      orderStatus: ['all'],
    })
  }

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
          <AdvancedFilters
            columns={columns}
            values={filters}
            onSubmit={advancedFiltersSubmit}
            onCancel={advancedFiltersCancel}
          />
          <Separator orientation="vertical" className="min-h-6 max-md:hidden" />
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
        <Tabs defaultValue="all" className="flex flex-wrap" value={selectedOrderStatus}>
          <TabsList className="flex flex-wrap">
            <TabsTrigger
              value="all"
              onClick={() => setFilters({ ...filters, orderStatus: ['all'] })}
            >
              {`${t('order-status.all')} ${allOrdersCount}`}
            </TabsTrigger>
            {displayedOrderStatuses.map(status => (
              <TabsTrigger
                key={status.id}
                value={status.id}
                onClick={() => setFilters({ ...filters, orderStatus: [status.id] })}
              >
                {`${status.names?.[language] ?? ''} ${status.ordersCount || 0}`}
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
