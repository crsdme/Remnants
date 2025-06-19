import type { ColumnSort } from '@tanstack/react-table'
import { flexRender, getCoreRowModel, getExpandedRowModel, useReactTable } from '@tanstack/react-table'
import { Warehouse } from 'lucide-react'
import { Fragment, useEffect, useMemo, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { useLanguageQuery, useProductQuery, useWarehouseQuery } from '@/api/hooks'
import { AdvancedFilters, AdvancedSorters, BatchEdit, ColumnVisibilityMenu, PermissionGate, TablePagination, TableSelectionDropdown } from '@/components'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Separator, Skeleton, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui'
import { useProductContext } from '@/contexts/ProductContext'

import { useDebounceCallback } from '@/utils/hooks'
import { useColumns } from './columns'
import { DataTableFilters } from './data-table-filters'

export function DataTable() {
  const { t, i18n } = useTranslation()
  const productContext = useProductContext()

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
  const [sorting, setSorting] = useState<ColumnSort[]>([])
  const [batchEditMode, setBatchEditMode] = useState<'filter' | 'select'>('select')
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  })
  const [filters, setFilters] = useState(filtersInitialState)
  const [expanded, setExpanded] = useState({})

  const sorters = useMemo(() => (
    Object.fromEntries(sorting.map(({ id, desc }) => [id, desc ? 'desc' : 'asc']))
  ), [sorting])

  const { data: { products = [], productsCount = 0 } = {}, isLoading, isFetching } = useProductQuery(
    { pagination, filters, sorters },
    { options: {
      select: response => ({
        products: response.data.products,
        productsCount: response.data.productsCount,
      }),
      placeholderData: prevData => prevData,
    } },
  )

  const { data: { languages = [] } = {} } = useLanguageQuery(
    { pagination: { full: true } },
    { options: {
      select: response => ({
        languages: response.data.languages,
      }),
    } },
  )

  const { data: { warehouses = [] } = {} } = useWarehouseQuery(
    { filters: { active: [true], language: i18n.language }, pagination: { full: true } },
    { options: {
      select: response => ({
        warehouses: response.data.warehouses,
      }),
    } },
  )

  useEffect(() => {
    if (!productContext.selectedWarehouse && warehouses.length > 0) {
      productContext.setSelectedWarehouse(warehouses[0].id)
    }
  }, [warehouses])

  const columns = useColumns()

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getExpandedRowModel: getExpandedRowModel(),
    onExpandedChange: setExpanded,
    // getSubRows: row => row.children,
    getRowId: row => (row as Product).id,
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
    </Fragment>
  )

  const renderTableBody = () => {
    if (isLoading || isFetching)
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

  const handleBulkExport = () => {
    productContext.exportProducts({ ids: Object.keys(rowSelection) })
    setRowSelection({})
  }

  const handleBulkRemove = () => {
    productContext.removeProduct({ ids: Object.keys(rowSelection) })
    setRowSelection({})
  }

  const handleBulkDuplicate = () => {
    productContext.duplicateProducts({ ids: Object.keys(rowSelection) })
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
    const selectedCategories = Object.keys(rowSelection)

    const params = data.map(item => ({
      column: item.column,
      value: item.value,
    }))

    productContext.batchProduct({
      ...(batchEditMode === 'filter' ? { filters } : { ids: selectedCategories }),
      params,
    })

    setRowSelection({})
  }

  const handleBatchToggle = (status: 'filter' | 'select') => {
    setBatchEditMode(status)
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
          <PermissionGate permission="category.batchEdit">
            <BatchEdit
              columns={columns}
              languages={languages}
              onSubmit={handleBatchSubmit}
              onToggle={handleBatchToggle}
            />
          </PermissionGate>
          <Separator orientation="vertical" className="min-h-6 max-md:hidden" />
          <DataTableFilters filters={filters} setFilters={setFilters} />
          <Select
            value={productContext.selectedWarehouse}
            onValueChange={productContext.setSelectedWarehouse}
          >
            <SelectTrigger className="w-[150px]">
              <Warehouse className="h-4 w-4 text-gray-400" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {warehouses.map(warehouse => (
                <SelectItem key={warehouse.id} value={warehouse.id}>
                  {warehouse.names[i18n.language]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <TableSelectionDropdown
            selectedCount={Object.keys(rowSelection).length}
            onExport={handleBulkExport}
            onRemove={handleBulkRemove}
            onDuplicate={handleBulkDuplicate}
          />
          <ColumnVisibilityMenu
            table={table}
            tableId="product"
          />
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
        totalPages={Math.ceil(productsCount / pagination.pageSize)}
        changePagination={changePagination}
        selectedCount={Object.keys(rowSelection).length}
        totalCount={productsCount}
      />
    </>
  )
}
