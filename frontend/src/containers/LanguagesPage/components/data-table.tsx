import { useRequestLanguages } from '@/api/hooks'

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
import { useLanguageContext } from '@/utils/contexts/language/LanguageContext'
import { downloadCsv } from '@/utils/helpers/downloadCsv'
import { useDebounceCallback } from '@/utils/hooks'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { Fragment, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useColumns } from './columns'
import { DataTableFilters } from './data-table-filters'

export function DataTable() {
  const { t } = useTranslation()
  const languageContext = useLanguageContext()

  const filtersInitialState = {
    name: '',
    code: '',
    priority: undefined,
    active: [],
    main: [],
    createdAt: { from: undefined, to: undefined },
    updatedAt: { from: undefined, to: undefined },
  }

  const [columnVisibility, setColumnVisibility] = useState({})
  const [rowSelection, setRowSelection] = useState({})
  const [sorters, setSorters] = useState({})
  const [batchEditMode, setBatchEditMode] = useState<'filter' | 'select'>('select')
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  })
  const [filters, setFilters] = useState(filtersInitialState)

  const requestLanguages = useRequestLanguages(
    { pagination, filters, sorters },
  )

  const columns = useColumns({ setSorters })
  const languages = requestLanguages?.data?.data?.languages || []
  const languagesCount = requestLanguages?.data?.data?.languagesCount || 0

  const table = useReactTable({
    data: languages,
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
    if (requestLanguages.isLoading || requestLanguages.isFetching)
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

  const handleBatchExport = () => {
    const filteredData = languages.filter((_, index) => rowSelection[index])
    const formatedItems = filteredData.map(item => ({
      name: item.name,
      code: item.code,
      priority: item.priority,
      active: item.active,
      main: item.main,
      updatedAt: item.updatedAt,
      createdAt: item.createdAt,
    }))

    downloadCsv(formatedItems, 'language-selected.csv', true)
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
    const selectedLanguages = languages
      .filter((_, index) => rowSelection[index])
      .map(item => item.id)

    const params = data.items.map(item => ({
      column: item.column,
      value: item.value,
    }))

    languageContext.batchLanguage({
      ids: selectedLanguages,
      params,
      ...(batchEditMode === 'filter' && { filters }),
    })

    setRowSelection({})
  }

  const handleBatchRemove = () => {
    const ids = languages.filter((_, index) => rowSelection[index]).map(item => item.id)
    languageContext.removeLanguage({ ids })
    setRowSelection({})
  }

  const handleBatchToggle = (status: 'filter' | 'select') => {
    setBatchEditMode(status)
  }

  const changePagination = useDebounceCallback((value: Pagination) => {
    setPagination(state => ({ ...state, ...value }))
  }, 50)

  const handleBatchDuplicate = () => {
    const ids = languages.filter((_, index) => rowSelection[index]).map(item => item.id)
    languageContext.duplicateLanguages({ ids })
    setRowSelection({})
  }

  const advancedSortersSubmit = (sorters) => {
    const sorterValues = Object.fromEntries(sorters.map(({ column, value }) => [column, value]))
    setSorters(state => ({ ...state, ...sorterValues }))
  }

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
          <ColumnVisibilityMenu table={table} tableId="language" />
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
        totalPages={Math.ceil(languagesCount / pagination.pageSize)}
        changePagination={changePagination}
        selectedCount={Object.keys(rowSelection).length}
        totalCount={languagesCount}
      />
    </>
  )
}
