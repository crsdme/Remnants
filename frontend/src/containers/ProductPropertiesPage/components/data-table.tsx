import type { ColumnSort } from '@tanstack/react-table'
import { flexRender, getCoreRowModel, getExpandedRowModel, useReactTable } from '@tanstack/react-table'
import { Pencil, Trash2 } from 'lucide-react'
import { Fragment, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useRequestProductProperties, useRequestProductPropertiesOptions } from '@/api/hooks'
import { AdvancedFilters, AdvancedSorters, ColumnVisibilityMenu, TablePagination, TableSelectionDropdown } from '@/components'
import { Badge, Button, Separator, Skeleton, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui'
import { useProductPropertiesContext } from '@/contexts'
import { useDebounceCallback } from '@/utils/hooks'

import { useColumns } from './columns'
import { DataTableFilters } from './data-table-filters'

export function DataTable() {
  const { t, i18n } = useTranslation()
  const productPropertiesContext = useProductPropertiesContext()

  const filtersInitialState = {
    names: '',
    isMultiple: undefined,
    isRequired: undefined,
    type: undefined,
    priority: undefined,
    active: [],
    language: i18n.language,
  }

  const [columnVisibility, setColumnVisibility] = useState({})
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<ColumnSort[]>([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  })
  const [filters, setFilters] = useState(filtersInitialState)
  const [expanded, setExpanded] = useState({})

  const sorters = useMemo(() => (
    Object.fromEntries(sorting.map(({ id, desc }) => [id, desc ? 'desc' : 'asc']))
  ), [sorting])

  const requestProductProperties = useRequestProductProperties(
    { pagination, filters, sorters },
    { options: { placeholderData: prevData => prevData } },
  )

  const productProperties = requestProductProperties.data?.data?.productProperties || []
  const productPropertiesCount = requestProductProperties.data?.data?.productPropertiesCount || 0

  const columns = useColumns()

  const table = useReactTable({
    data: productProperties,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getExpandedRowModel: getExpandedRowModel(),
    onExpandedChange: setExpanded,
    // getSubRows: row => row.options,
    getRowId: row => row.id,
    onSortingChange: setSorting,
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
      {row.getIsExpanded() && row.original.options?.length > 0 && (
        <SubRowOptions
          optionIds={row.original.options}
          language={i18n.language}
          columnsLength={columns.length}
          editOption={productPropertiesContext.openOptionsModal}
          removeOption={productPropertiesContext.removeProductPropertyOption}
        />
      )}
    </Fragment>
  )

  const renderTableBody = () => {
    if (requestProductProperties.isLoading || requestProductProperties.isFetching)
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

  const handleBulkRemove = () => {
    productPropertiesContext.removeProductProperty({ ids: Object.keys(rowSelection) })
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
          <ColumnVisibilityMenu table={table} tableId="product-properties" />
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
        totalPages={Math.ceil(productPropertiesCount / pagination.pageSize)}
        changePagination={changePagination}
        selectedCount={Object.keys(rowSelection).length}
        totalCount={productPropertiesCount}
      />
    </>
  )
}

function SubRowOptions({ optionIds, language, columnsLength, editOption, removeOption }) {
  const enabled = !!optionIds.length

  const { data, isLoading, isFetching, error } = useRequestProductPropertiesOptions(
    { pagination: { full: true }, filters: { ids: optionIds, language } },
    { options: { placeholderData: prevData => prevData } },
  )

  const options = data?.data?.productPropertiesOptions || []

  if (!enabled)
    return null
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
          {options.map(option => (
            <Badge key={option.id}>
              {option.color && <div className="w-3 h-3 rounded-full border border-black" style={{ backgroundColor: option.color }} />}
              {option.names[language]}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeOption({ ids: [option.id] })}
                className="h-4 w-4 ml-1"
              >
                <Trash2 />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => editOption({ option })}
                className="h-4 w-4 ml-1"
              >
                <Pencil />
              </Button>
            </Badge>
          ))}
        </div>
      </TableCell>
    </TableRow>
  )
}
