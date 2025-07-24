import { flexRender, getCoreRowModel, getExpandedRowModel, useReactTable } from '@tanstack/react-table'
import { Pencil } from 'lucide-react'
import { Fragment, useMemo, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { useCurrencyExcangeRateQuery, useCurrencyQuery, useLanguageQuery } from '@/api/hooks'
import { AdvancedFilters, AdvancedSorters, BatchEdit, ColumnVisibilityMenu, PermissionGate, TablePagination, TableSelectionDropdown } from '@/components'
import { Badge, Button, Separator, Skeleton, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui'
import { useCurrencyContext } from '@/contexts'
import { downloadCsv } from '@/utils/helpers/download'
import { useDebounceCallback } from '@/utils/hooks'

import { useColumns } from './columns'
import { DataTableFilters } from './data-table-filters'

export function DataTable() {
  const { t, i18n } = useTranslation()
  const { batchCurrency, removeCurrency, duplicateCurrencies, openExchangeRateModal } = useCurrencyContext()

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
  const [sorting, setSorting] = useState([])
  const [batchEditMode, setBatchEditMode] = useState<'filter' | 'select'>('select')
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  })
  const [filters, setFilters] = useState(filtersInitialState)
  const [expanded, setExpanded] = useState({})
  const columns = useColumns()

  const sorters = useMemo(() => (
    Object.fromEntries(sorting.map(({ id, desc }) => [id, desc ? 'desc' : 'asc']))
  ), [sorting])

  const { data: { currencies = [], currenciesCount = 0 } = {}, isLoading, isFetching } = useCurrencyQuery(
    { pagination, filters, sorters },
    { options: {
      select: response => ({
        currencies: response.data.currencies,
        currenciesCount: response.data.currenciesCount,
      }),
      placeholderData: prevData => prevData,
    } },
  )

  const { data: { languages = [] } = {} } = useLanguageQuery(
    { pagination: { full: true } },
    { options: { select: response => ({
      languages: response.data.languages,
    }) } },
  )

  const table = useReactTable({
    data: currencies,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    getExpandedRowModel: getExpandedRowModel(),
    onExpandedChange: setExpanded,
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
      expanded,
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
          {row.getIsExpanded() && (
            <SubRowExchangeRates
              property={row.original}
              columnsLength={columns.length}
              editExchangeRate={exchangeRate => openExchangeRateModal(exchangeRate)}
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

  const handleBulkExport = () => {
    const filteredData = currencies.filter((_, index) => rowSelection[index])
    const formatedCurrencies = filteredData.map(item => ({
      names: item.names[i18n.language],
      symbols: item.symbols[i18n.language],
      priority: item.priority,
      active: item.active,
      updatedAt: item.updatedAt,
      createdAt: item.createdAt,
    }))

    downloadCsv(formatedCurrencies, 'currency-selected.csv', true)
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

  const handleBatchSubmit = (data) => {
    const selectedCurrencies = currencies
      .filter((_, index) => rowSelection[index])
      .map(item => item.id)

    const params = data.map(item => ({
      column: item.column,
      value: item.value,
    }))

    batchCurrency({
      ...(batchEditMode === 'filter' ? { filters } : { ids: selectedCurrencies }),
      params,
    })

    setRowSelection({})
  }

  const handleBulkRemove = () => {
    const ids = currencies.filter((_, index) => rowSelection[index]).map(item => item.id)
    removeCurrency({ ids })
    setRowSelection({})
  }

  const handleBatchToggle = (status: 'filter' | 'select') => {
    setBatchEditMode(status)
  }

  const changePagination = useDebounceCallback((value: Pagination) => {
    setPagination(state => ({ ...state, ...value }))
  }, 50)

  const handleBulkDuplicate = () => {
    const ids = currencies.filter((_, index) => rowSelection[index]).map(item => item.id)
    duplicateCurrencies({ ids })
    setRowSelection({})
  }

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
          <PermissionGate permission="currency.batchEdit">
            <BatchEdit
              columns={columns}
              languages={languages}
              onSubmit={handleBatchSubmit}
              onToggle={handleBatchToggle}
            />
          </PermissionGate>
          <Separator orientation="vertical" className="min-h-6 max-md:hidden" />
          <DataTableFilters filters={filters} setFilters={setFilters} />
        </div>
        <div className="flex gap-2">
          <TableSelectionDropdown
            selectedCount={Object.keys(rowSelection).length}
            onExport={handleBulkExport}
            onRemove={handleBulkRemove}
            onDuplicate={handleBulkDuplicate}
          />
          <ColumnVisibilityMenu table={table} tableId="currency" />
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
        totalPages={Math.ceil(currenciesCount / pagination.pageSize)}
        changePagination={changePagination}
        selectedCount={Object.keys(rowSelection).length}
        totalCount={currenciesCount}
      />
    </>
  )
}

function SubRowExchangeRates({ property, columnsLength, editExchangeRate }) {
  const { data, isLoading, isFetching, error } = useCurrencyExcangeRateQuery(
    { filters: { fromCurrency: property.id } },
    { options: { placeholderData: prevData => prevData } },
  )

  const { i18n } = useTranslation()

  const exchangeRates = data?.data?.exchangeRates || []

  if (isLoading || isFetching) {
    return (
      <TableRow className="animate-pulse">
        <TableCell colSpan={columnsLength}>
          <Skeleton className="h-8 w-full" />
        </TableCell>
      </TableRow>
    )
  }
  if (error) {
    return (
      <TableRow>
        <TableCell colSpan={columnsLength}>ERROR</TableCell>
      </TableRow>
    )
  }

  return (
    <TableRow>
      <TableCell colSpan={columnsLength} className="w-full">
        <div className="flex flex-wrap gap-2 w-full">
          {exchangeRates.map(exchangeRate => (
            <Badge
              key={exchangeRate.id}
              className="inline-flex items-center gap-1 pr-1 pl-2"
            >
              <span className="truncate">
                {`${exchangeRate.rate} ${exchangeRate.toCurrency.symbols[i18n.language]} (${exchangeRate.toCurrency.names[i18n.language]})`}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent focus-visible:ring-0"
                onClick={() => editExchangeRate(exchangeRate)}
              >
                <Pencil className="text-muted-foreground" />
              </Button>
            </Badge>

          ))}
        </div>
      </TableCell>
    </TableRow>
  )
}
