import { useRequestLanguages } from '@/api/hooks'

import { useLanguageContext } from '@/utils/contexts/language/LanguageContext'

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
  const [expandedRows, setExpandedRows] = useState({})
  const [batchEditMode, setBatchEditMode] = useState<'filter' | 'select'>('select')
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  })
  const [filters, setFilters] = useState(filtersInitialState)

  const requestLanguages = useRequestLanguages(
    { pagination, filters, sorters },
  )

  const columns = useColumns({ setSorters, expandedRows, setExpandedRows })
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

    const csv = Papa.unparse(formatedItems)
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
          {expandedRows[row.id] && (
            <TableRow>
              <TableCell colSpan={columns.length} className="bg-muted/50">
                <div className="p-4">
                  <h4 className="font-semibold mb-2">{t('page.languages.table.details')}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t('page.languages.table.createdAt')}
                      </p>
                      <p>{row.original.createdAt.toString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t('page.languages.table.updatedAt')}
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
          {t('page.languages.table.noResults')}
        </TableCell>
      </TableRow>
    )
  }

  const handleBatchSubmit = (data) => {
    const selectedLanguages = languages
      .filter((_, index) => rowSelection[index])
      .map(item => item._id)

    const params = data.items.map(item => ({
      column: item.column,
      value: item.value,
    }))

    if (batchEditMode === 'filter') {
      languageContext.batchLanguage({ _ids: selectedLanguages, filters, params })
    }
    else {
      languageContext.batchLanguage({ _ids: selectedLanguages, params })
    }

    setRowSelection({})
  }

  const handleBatchRemove = () => {
    const _ids = languages.filter((_, index) => rowSelection[index]).map(item => item._id)
    languageContext.removeLanguage({ _ids })
    setRowSelection({})
  }

  const handleBatchToggle = (status: 'filter' | 'select') => {
    setBatchEditMode(status)
  }

  const changePagination = useDebounceCallback((value: Pagination) => {
    setPagination(state => ({ ...state, ...value }))
  }, 50)

  const handleBatchDuplicate = () => {
    const _ids = languages.filter((_, index) => rowSelection[index]).map(item => item._id)
    languageContext.duplicateLanguages({ _ids })
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
          <ColumnVisibilityMenu table={table} tableId="language" />
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
        totalPages={Math.ceil(languagesCount / pagination.pageSize)}
        changePagination={changePagination}
        selectedCount={Object.keys(rowSelection).length}
        totalCount={languagesCount}
      />
    </>
  )
}
