import type { ProductPopulatedDTO } from '@remnant/shared'
import type { Row } from '@tanstack/react-table'
import { flexRender, getCoreRowModel, getExpandedRowModel, useReactTable } from '@tanstack/react-table'
import { Warehouse } from 'lucide-react'

import { Fragment, useEffect, useState } from 'react'
import { useLanguageQuery, useProductQuery, useWarehouseQuery } from '@/api/hooks'
import { BatchEdit, ColumnVisibilityMenu, PermissionGate, TablePagination, TableSelectionDropdown } from '@/components'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Separator, Skeleton, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui'

import { useLocale } from '@/utils/hooks'
import { useProductContext } from '../context'
import { useColumns } from './columns'
import { DataTableFilters } from './data-table-filters'

export function DataTable() {
  const { t, language } = useLocale()
  const productContext = useProductContext()
  const [columnVisibility, setColumnVisibility] = useState({})
  const [rowSelection, setRowSelection] = useState({})
  const [batchEditMode, setBatchEditMode] = useState<'filter' | 'select'>('select')

  const {
    pagination,
    setPagination,
    setSorting,
    filters,
    setFilters,
    sorters,
    sorting,
  } = productContext.listQueryState

  const { products, productsCount, isLoading, isFetching } = useProductQuery(
    { pagination, filters, sorters },
    // { options: { placeholderData: prevData => prevData } },
  )

  const { languages } = useLanguageQuery(
    { pagination: { full: true } },
  )

  const { warehouses } = useWarehouseQuery(
    { filters: { active: [true] }, pagination: { full: true } },
  )

  const columns = useColumns({ filters })

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    manualSorting: true,
    getExpandedRowModel: getExpandedRowModel(),
    getRowId: row => row.id,
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

  useEffect(() => {
    if (!filters.selectedWarehouse && warehouses.length > 0)
      setFilters({ ...filters, selectedWarehouse: warehouses[0].id })
  }, [warehouses])

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

  const renderRow = (row: Row<ProductPopulatedDTO>) => (
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
        <TableCell colSpan={1} className="h-24 text-center">
          {t('table.noResults')}
        </TableCell>
      </TableRow>
    )
  }

  const handleBulkExport = () => {
    productContext.exportProducts({ ids: Object.keys(rowSelection) })
    setRowSelection({})
  }

  const handleBulkRemove = () => {
    productContext.removeProduct({ ids: Object.keys(rowSelection) })
    setRowSelection({})
  }

  const handleBatchSubmit = (data: any) => {
    const selectedCategories = Object.keys(rowSelection)

    const params = data.map((item: any) => ({
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

  return (
    <>
      <div className="w-full flex justify-between items-start max-md:flex-col gap-2 py-2">
        <div className="flex flex-wrap gap-2 items-center">
          {/* <AdvancedFilters
            columns={columns}
            onSubmit={advancedFiltersSubmit}
            onCancel={advancedFiltersCancel}
          />
          <AdvancedSorters
            columns={columns}
            onSubmit={advancedSortersSubmit}
            onCancel={advancedSortersCancel}
          /> */}
          <PermissionGate permission="category.batchEdit">
            <BatchEdit
              columns={columns}
              languages={languages}
              onSubmit={handleBatchSubmit}
              onToggle={handleBatchToggle}
            />
          </PermissionGate>
          <Separator orientation="vertical" className="min-h-6 max-md:hidden" />
          <DataTableFilters filters={filters} setFilters={v => setFilters({ ...filters, ...v })} />
          <Select
            value={filters.selectedWarehouse}
            onValueChange={(v) => {
              setFilters({ ...filters, selectedWarehouse: v })
            }}
          >
            <SelectTrigger className="w-[150px]">
              <Warehouse className="h-4 w-4 text-gray-400" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {warehouses.map(warehouse => (
                <SelectItem key={warehouse.id} value={warehouse.id}>
                  {warehouse.names[language]}
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
        changePagination={setPagination}
        selectedCount={Object.keys(rowSelection).length}
        totalCount={productsCount}
      />
    </>
  )
}
