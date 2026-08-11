import type { CurrencyDTO, ExchangeRateDTOPopulated } from '@remnant/shared'
import { flexRender, getCoreRowModel, getExpandedRowModel, useReactTable } from '@tanstack/react-table'
import { Pencil } from 'lucide-react'

import { Fragment, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCurrencyExcangeRateQuery, useCurrencyQuery } from '@/api/hooks'
import { ColumnVisibilityMenu, TablePagination } from '@/components'
import { Badge, Button, Skeleton, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui'
import { useListQueryState, useLocale } from '@/utils/hooks'

import { useCurrencyContext } from '../context'
import { useColumns } from './columns'
import { DataTableFilters } from './data-table-filters'

export function DataTable() {
  const { t } = useTranslation()
  const { openExchangeRateModal } = useCurrencyContext()

  const {
    filters,
    setFilters,
    sorting,
    setSorting,
    pagination,
    setPagination,
    sorters,
  } = useListQueryState({
    readFilters: params => ({
      names: params.get('names'),
    }),
    writeFilters: (params, filters) => {
      params.set('names', filters.names ?? '')
    },
  })

  const [columnVisibility, setColumnVisibility] = useState({})
  const [expanded, setExpanded] = useState({})
  const columns = useColumns()

  const { currencies, currenciesCount, isLoading, isFetching } = useCurrencyQuery(
    { pagination, filters, sorters },
    { options: { placeholderData: prevData => prevData } },
  )

  const table = useReactTable({
    data: currencies,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: setSorting,
    getExpandedRowModel: getExpandedRowModel(),
    onExpandedChange: setExpanded,
    manualSorting: true,
    enableSortingRemoval: true,
    state: {
      sorting,
      columnVisibility,
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

  return (
    <>
      <div className="w-full flex justify-between items-start max-md:flex-col gap-2 py-2">
        <div className="flex flex-wrap gap-2 items-center">
          <DataTableFilters filters={filters} setFilters={setFilters} />
        </div>
        <div className="flex gap-2">
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
        changePagination={setPagination}
        totalCount={currenciesCount}
      />
    </>
  )
}

function SubRowExchangeRates({ property, columnsLength, editExchangeRate }:
{
  property: CurrencyDTO
  columnsLength: number
  editExchangeRate: (exchangeRate: ExchangeRateDTOPopulated) => void
}) {
  const { items: exchangeRates = [], isLoading, isFetching, error } = useCurrencyExcangeRateQuery(
    { pagination: { full: true }, filters: { fromCurrencyId: property.id } },
    { options: { placeholderData: prevData => prevData } },
  )
 
  const { language } = useLocale()

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
                {`${exchangeRate.rate} ${exchangeRate.toCurrency.symbols[language]} (${exchangeRate.toCurrency.names[language]})`}
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
