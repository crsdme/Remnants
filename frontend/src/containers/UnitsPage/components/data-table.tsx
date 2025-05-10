import { useRequestLanguages, useRequestUnits } from '@/api/hooks'

import { useUnitContext } from '@/utils/contexts/unit/UnitContext'

import { useDebounceCallback } from '@/utils/hooks'
import { AdvancedFilters } from '@/components/AdvancedFilters'
import { AdvancedSorters } from '@/components/AdvancedSorters'

import { BatchEdit } from '@/components/BatchEdit'
import { ColumnVisibilityMenu } from '@/components/ColumnVisibilityMenu'

import TablePagination from '@/components/TablePagination'
import TableSelectionDropdown from '@/components/TableSelectionDropdown'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import Papa from 'papaparse'
import { Fragment, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useColumns } from './columns'
import { DataTableFilters } from './data-table-filters'

export function DataTable() {
  const { t, i18n } = useTranslation()
  const unitContext = useUnitContext()

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

  const requestUnits = useRequestUnits(
    { pagination, filters, sorters },
    { options: { placeholderData: prevData => prevData } },
  )

  const columns = useColumns({ setSorters, expandedRows, setExpandedRows })
  const units = requestUnits?.data?.data?.units || []
  const unitsCount = requestUnits?.data?.data?.unitsCount || 0

  const requestLanguages = useRequestLanguages({ pagination: { full: true } })
  const languages = requestLanguages.data?.data?.languages || []

  const table = useReactTable({
    data: units,
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
    const filteredData = units.filter((_, index) => rowSelection[index])
    const formatedUnits = filteredData.map(item => ({
      names: item.names[i18n.language],
      symbols: item.symbols[i18n.language],
      priority: item.priority,
      active: item.active,
      updatedAt: item.updatedAt,
      createdAt: item.createdAt,
    }))

    const csv = Papa.unparse(formatedUnits)
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
    if (requestUnits.isLoading || requestUnits.isFetching)
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
                  <h4 className="font-semibold mb-2">{t('page.units.table.details')}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t('page.units.table.createdAt')}
                      </p>
                      <p>{row.original.createdAt.toString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t('page.units.table.updatedAt')}
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
          {t('page.units.table.noResults')}
        </TableCell>
      </TableRow>
    )
  }

  const handleBatchSubmit = (data) => {
    const selectedUnits = units
      .filter((_, index) => rowSelection[index])
      .map(item => item._id)

    const params = data.items.map(item => ({
      column: item.column,
      value: item.value,
    }))

    if (batchEditMode === 'filter') {
      unitContext.batchUnit({ _ids: selectedUnits, filters, params })
    }
    else {
      unitContext.batchUnit({ _ids: selectedUnits, params })
    }

    setRowSelection({})
  }

  const handleBatchRemove = () => {
    const _ids = units.filter((_, index) => rowSelection[index]).map(item => item._id)
    unitContext.removeUnit({ _ids })
    setRowSelection({})
  }

  const handleBatchToggle = (status: 'filter' | 'select') => {
    setBatchEditMode(status)
  }

  const changePagination = useDebounceCallback((value: Pagination) => {
    setPagination(state => ({ ...state, ...value }))
  }, 50)

  const handleBatchDuplicate = () => {
    const _ids = units.filter((_, index) => rowSelection[index]).map(item => item._id)
    unitContext.duplicateUnits({ _ids })
    setRowSelection({})
  }

  const advancedSortersSubmit = (sorters) => {
    const sorterValues = Object.fromEntries(sorters.map(({ column, value }) => [column, value]))
    setSorters(state => ({ ...state, ...sorterValues }))
  }

  // const advancedFiltersSubmit = (filters) => {
  //   const filterValues = Object.fromEntries(filters.map(({ column, value }) => [column, value]))
  //   setFilters(state => ({
  //     ...state,
  //     ...filterValues,
  //   }))
  // }

  const advancedSortersCancel = () => {
    setSorters({})
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
            onExport={handleBatchExport}
            onRemove={handleBatchRemove}
            onDuplicate={handleBatchDuplicate}
          />
          <ColumnVisibilityMenu table={table} tableId="unit" />
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
        totalPages={Math.ceil(unitsCount / pagination.pageSize)}
        changePagination={changePagination}
        selectedCount={Object.keys(rowSelection).length}
        totalCount={unitsCount}
      />
    </>
  )
}
