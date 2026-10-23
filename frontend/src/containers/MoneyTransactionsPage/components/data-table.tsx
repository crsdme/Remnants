import { flexRender, getCoreRowModel, getExpandedRowModel, useReactTable } from '@tanstack/react-table'
import { Fragment, useState } from 'react'

import { useMoneyTransactionQuery } from '@/api/hooks'
import { AdvancedFilters, ColumnVisibilityMenu, TablePagination, TableSelectionDropdown } from '@/components'
import { Separator, Skeleton, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui'
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
import { MoneyTransactionExpandedRow } from './expanded-row'

interface DateRangeFilter {
  from?: Date
  to?: Date
}

interface MoneyTransactionListFilters extends Record<string, unknown> {
  amount?: string | number
  type?: string[]
  accountId?: string
  cashregister?: string
  confirmed?: string[]
  createdAt?: DateRangeFilter
}

function readDateRange(from?: string, to?: string): DateRangeFilter | undefined {
  const fromDate = parseQueryDate(from)
  const toDate = parseQueryDate(to)
  if (!fromDate || !toDate)
    return undefined
  return { from: fromDate, to: toDate }
}

export function DataTable() {
  const { t } = useLocale()

  const [columnVisibility, setColumnVisibility] = useState({})
  const [rowSelection, setRowSelection] = useState({})
  const [expanded, setExpanded] = useState({})

  const {
    pagination,
    setPagination,
    sorting,
    setSorting,
    filters,
    setFilters,
    sorters,
  } = useListQueryState<MoneyTransactionListFilters>({
    readFilters: (params) => {
      const type = parseQueryCsv(params.get('type'))
      const confirmed = parseQueryCsv(params.get('confirmed'))
      return {
        amount: params.get('amount') ?? undefined,
        ...(type.length ? { type } : {}),
        accountId: params.get('accountId') ?? undefined,
        cashregister: params.get('cashregister') ?? undefined,
        ...(confirmed.length ? { confirmed } : {}),
        createdAt: readDateRange(params.get('createdAtFrom'), params.get('createdAtTo')),
      }
    },
    writeFilters: (params, next) => {
      setQueryParam(params, 'amount', next.amount ?? '')
      setQueryParamCsv(params, 'type', next.type ?? [])
      setQueryParam(params, 'accountId', next.accountId ?? '')
      setQueryParam(params, 'cashregister', next.cashregister ?? '')
      setQueryParamCsv(params, 'confirmed', next.confirmed ?? [])
      setQueryParam(params, 'createdAtFrom', next.createdAt?.from?.toISOString() ?? null)
      setQueryParam(params, 'createdAtTo', next.createdAt?.to?.toISOString() ?? null)
    },
  })
  const columns = useColumns()

  const { moneyTransactions, moneyTransactionsCount, isLoading, isFetching } = useMoneyTransactionQuery(
    { pagination, filters, sorters },
    { options: { placeholderData: prevData => prevData } },
  )

  const table = useReactTable({
    data: moneyTransactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onExpandedChange: setExpanded,
    manualSorting: true,
    enableSortingRemoval: true,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      expanded,
      pagination: {
        pageIndex: pagination.current - 1,
        pageSize: pagination.pageSize,
      },
    },
  })

  const advancedFiltersSubmit = (items: { column: string, value: unknown }[]) => {
    setFilters({
      amount: undefined,
      type: undefined,
      accountId: undefined,
      cashregister: undefined,
      confirmed: undefined,
      createdAt: undefined,
      ...Object.fromEntries(items.map(({ column, value }) => [column, value])),
    })
  }

  const advancedFiltersCancel = () => {
    setFilters({
      amount: undefined,
      type: undefined,
      accountId: undefined,
      cashregister: undefined,
      confirmed: undefined,
      createdAt: undefined,
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
          {row.getIsExpanded() && (
            <MoneyTransactionExpandedRow
              item={row.original}
              columnsLength={row.getVisibleCells().length}
            />
          )}
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
          <ColumnVisibilityMenu table={table} tableId="money-transactions" />
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
        totalPages={Math.ceil(moneyTransactionsCount / pagination.pageSize)}
        changePagination={setPagination}
        selectedCount={Object.keys(rowSelection).length}
        totalCount={moneyTransactionsCount}
      />
    </>
  )
}
