import { useRequestCurrencies, useRequestLanguages } from '@/api/hooks'

import { useCurrencyContext } from '@/utils/contexts/currency/CurrencyContext'

import { useDebounceCallback } from '@/utils/hooks'
import { AdvancedFilters } from '@/view/components/AdvancedFilters'
import { BatchEdit } from '@/view/components/BatchEdit'

import { ColumnVisibilityMenu } from '@/view/components/ColumnVisibilityMenu'
import TablePagination from '@/view/components/TablePagination'

import TableSelectionDropdown from '@/view/components/TableSelectionDropdown'
import { Separator } from '@/view/components/ui/separator'
import { Skeleton } from '@/view/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/view/components/ui/table'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import Papa from 'papaparse'
import { Fragment, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useColumns } from './columns'
import { DataTableFilters } from './data-table-filters'

export function DataTable() {
  const { t, i18n } = useTranslation()
  const currencyContext = useCurrencyContext()

  const filtersInitialState = {
    names: '',
    symbols: '',
    priority: undefined,
    active: [],
    createdAt: { from: undefined, to: undefined },
    language: i18n.language,
  }

  const [columnVisibility, setColumnVisibility] = useState({})
  const [rowSelection, setRowSelection] = useState({})
  const [sorters, setSorters] = useState({})
  const [expandedRows, setExpandedRows] = useState({})
  const [batchEditMode, setBatchEditMode] = useState<'filter' | 'select'>('select')
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  })
  const [filters, setFilters] = useState(filtersInitialState)

  const requestCurrencies = useRequestCurrencies(
    { pagination, filters, sorters },
    { options: { placeholderData: prevData => prevData } },
  )

  const columns = useColumns({ setSorters, expandedRows, setExpandedRows })
  const currencies = requestCurrencies?.data?.data?.currencies || []
  const currenciesCount = requestCurrencies?.data?.data?.currenciesCount || 0

  const requestLanguages = useRequestLanguages({ pagination: { full: true } })
  const languages = requestLanguages.data?.data?.languages || []

  const table = useReactTable({
    data: currencies,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex: pagination.current - 1,
        pageSize: pagination.pageSize,
      },
    },
  })

  const handleBatchExport = () => {
    const filteredData = currencies.filter((_, index) => rowSelection[index])
    const formatedCurrencies = filteredData.map(item => ({
      names: item.names[i18n.language],
      symbols: item.symbols[i18n.language],
      priority: item.priority,
      active: item.active,
      updatedAt: item.updatedAt,
      createdAt: item.createdAt,
    }))

    const csv = Papa.unparse(formatedCurrencies)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'data.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setRowSelection({})
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
    if (requestCurrencies.isLoading || requestCurrencies.isFetching)
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
          {expandedRows[row.id] && (
            <TableRow>
              <TableCell colSpan={columns.length} className="bg-muted/50">
                <div className="p-4">
                  <h4 className="font-semibold mb-2">{t('page.currencies.table.details')}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t('page.currencies.table.createdAt')}
                      </p>
                      <p>{row.original.createdAt.toString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t('page.currencies.table.updatedAt')}
                      </p>
                      <p>{row.original.updatedAt.toString()}</p>
                    </div>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          )}
        </Fragment>
      ))
    }

    return (
      <TableRow>
        <TableCell colSpan={columns.length} className="h-24 text-center">
          {t('page.currencies.table.noResults')}
        </TableCell>
      </TableRow>
    )
  }

  const handleBatchSubmit = (data) => {
    const selectedCurrencies = currencies
      .filter((_, index) => rowSelection[index])
      .map(item => item._id)

    const params = data.items.map(item => ({
      column: item.column,
      value: item.value,
    }))

    if (batchEditMode === 'filter') {
      currencyContext.batchCurrency({ _ids: selectedCurrencies, filters, params })
    }
    else {
      currencyContext.batchCurrency({ _ids: selectedCurrencies, params })
    }

    setRowSelection({})
  }

  const handleBatchRemove = () => {
    const _ids = currencies.filter((_, index) => rowSelection[index]).map(item => item._id)
    currencyContext.removeCurrency({ _ids })
    setRowSelection({})
  }

  const handleBatchToggle = (status: 'filter' | 'select') => {
    setBatchEditMode(status)
  }

  const changePagination = useDebounceCallback((value: Pagination) => {
    setPagination(state => ({ ...state, ...value }))
  }, 50)

  const handleBatchDuplicate = () => {
    const _ids = currencies.filter((_, index) => rowSelection[index]).map(item => item._id)
    currencyContext.duplicateCurrencies({ _ids })
    setRowSelection({})
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
          <BatchEdit
            columns={columns}
            languages={languages}
            onSubmit={handleBatchSubmit}
            onToggle={handleBatchToggle}
          />
          <Separator orientation="vertical" className="min-h-6 max-md:hidden" />
          <DataTableFilters filters={filters} setFilters={setFilters} />
        </div>
        <div className="flex gap-2">
          <TableSelectionDropdown
            selectedCount={Object.keys(rowSelection).length}
            onExport={handleBatchExport}
            onRemove={handleBatchRemove}
            onDuplicate={handleBatchDuplicate}
          />
          <ColumnVisibilityMenu table={table} tableId="currency" />
        </div>
      </div>
      <div className="border rounded-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
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
            ))}
          </TableHeader>
          <TableBody>{renderTableBody()}</TableBody>
        </Table>
      </div>
      <TablePagination
        pagination={pagination}
        totalPages={Math.ceil(currenciesCount / pagination.pageSize)}
        changePagination={changePagination}
        selectedCount={Object.keys(rowSelection).length}
        totalCount={currenciesCount}
      />
    </>
  )
}
