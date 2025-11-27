import { flexRender, getCoreRowModel, getExpandedRowModel, useReactTable } from '@tanstack/react-table'
import { Fragment, useMemo, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { useProcurementItemsQuery, useProcurementQuery } from '@/api/hooks'
import { AdvancedFilters, AdvancedSorters, ColumnVisibilityMenu, TablePagination, TableSelectionDropdown } from '@/components'
import { Badge, Skeleton, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui'
import { useDebounceCallback } from '@/utils/hooks'

import { useProcurementContext } from '../context'
import { useColumns } from './columns'

export function DataTable() {
  const { t, i18n } = useTranslation()
  const { removeProcurement } = useProcurementContext()

  const filtersInitialState = {}

  const [columnVisibility, setColumnVisibility] = useState({})
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState([])
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

  const { data: { procurements = [], procurementsCount = 0 } = {}, isLoading, isFetching } = useProcurementQuery(
    { pagination, filters, sorters },
    { options: {
      select: response => ({
        procurements: response.data.procurements,
        procurementsCount: response.data.procurementsCount,
      }),
      placeholderData: prevData => prevData,
    } },
  )

  const table = useReactTable({
    data: procurements,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onExpandedChange: setExpanded,
    manualSorting: true,
    enableSortingRemoval: true,
    state: {
      sorting,
      columnVisibility,
      expanded,
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
          {row.getIsExpanded() && (
            <SubRowItems
              procurementId={row.original.id}
              columnsLength={columns.length}
              language={i18n.language}
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
    const ids = procurements.filter((_, index) => rowSelection[index]).map(item => item.id)
    removeProcurement({ ids })
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
        </div>
        <div className="flex gap-2">
          <TableSelectionDropdown
            selectedCount={Object.keys(rowSelection).length}
            onRemove={handleBulkRemove}
          />
          <ColumnVisibilityMenu table={table} tableId="cashregister-account" />
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
        totalPages={Math.ceil(procurementsCount / pagination.pageSize)}
        changePagination={changePagination}
        selectedCount={Object.keys(rowSelection).length}
        totalCount={procurementsCount}
      />
    </>
  )
}

function SubRowItems({ procurementId, columnsLength, language }) {
  const { data, isLoading, isFetching, error } = useProcurementItemsQuery(
    { filters: { procurementId } },
    { options: { placeholderData: prevData => prevData } },
  )

  const itemsData = data?.data?.procurementItems || []

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
          {itemsData.map(item => (
            <Badge key={item.id}>
              {`${item.product.names[language]} - ${item.quantity}`}
            </Badge>
          ))}
        </div>
      </TableCell>
    </TableRow>
  )
}
