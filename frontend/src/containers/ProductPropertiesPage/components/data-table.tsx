import type { ProductPropertyDTO, ProductPropertyOptionDTO } from '@remnant/shared'
import type { Row } from '@tanstack/react-table'
import { flexRender, getCoreRowModel, getExpandedRowModel, useReactTable } from '@tanstack/react-table'
import { Pencil, SearchIcon, Trash2 } from 'lucide-react'
import { Fragment, useMemo, useState } from 'react'

import { useProductPropertyOptionQuery, useProductPropertyQuery } from '@/api/hooks'
import { ColumnVisibilityMenu, TablePagination } from '@/components'
import { Badge, Button, Input, Skeleton, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui'
import { useListQueryState, useLocale } from '@/utils/hooks'

import { useProductPropertiesContext } from '../context'
import { useColumns } from './columns'
import { DataTableFilters } from './data-table-filters'

const OPTION_TYPES = new Set(['select', 'multiSelect', 'color'])

export function DataTable() {
  const { t } = useLocale()
  const productPropertiesContext = useProductPropertiesContext()
  const {
    pagination,
    setPagination,
    sorting,
    setSorting,
    filters,
    setFilters,
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

  const { productProperties = [], productPropertiesCount = 0, isLoading, isFetching } = useProductPropertyQuery(
    { pagination, filters, sorters },
    { options: { placeholderData: prevData => prevData } },
  )

  const columns = useColumns()

  const table = useReactTable({
    data: productProperties,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    getExpandedRowModel: getExpandedRowModel(),
    onExpandedChange: setExpanded,
    onSortingChange: setSorting,
    manualSorting: true,
    enableSortingRemoval: true,
    getRowCanExpand: row => OPTION_TYPES.has(row.original.type),
    state: {
      sorting,
      columnVisibility,
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

  const renderRow = (row: Row<ProductPropertyDTO>) => (
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
      {row.getIsExpanded() && OPTION_TYPES.has(row.original.type) && (
        <SubRowOptions
          property={row.original}
          columnsLength={columns.length}
          editOption={productPropertiesContext.openOptionsModal}
          removeOption={productPropertiesContext.removeOption}
        />
      )}
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

  return (
    <>
      <div className="w-full flex justify-between items-start max-md:flex-col gap-2 py-2">
        <div className="flex flex-wrap gap-2 items-center">
          <DataTableFilters filters={filters} setFilters={setFilters} />
        </div>
        <div className="flex gap-2">
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
        changePagination={setPagination}
        totalCount={productPropertiesCount}
      />
    </>
  )
}

function SubRowOptions({ property, columnsLength, editOption, removeOption }:
{
  property: ProductPropertyDTO
  columnsLength: number
  editOption: (option: ProductPropertyOptionDTO, property: ProductPropertyDTO) => void
  removeOption: ({ ids }: { ids: string[] }) => void
}) {
  const { t, language } = useLocale()
  const [search, setSearch] = useState('')

  const { productPropertyOptions, isLoading, error } = useProductPropertyOptionQuery(
    {
      pagination: { full: true },
      filters: { productPropertyId: property.id, language },
      sorters: { priority: 'asc' },
    },
    { options: { placeholderData: prevData => prevData } },
  )

  const filteredOptions = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query)
      return productPropertyOptions
    return productPropertyOptions.filter(option =>
      (option.names[language] ?? '').toLowerCase().includes(query),
    )
  }, [productPropertyOptions, search, language])

  if (isLoading && productPropertyOptions.length === 0) {
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
      <TableCell colSpan={columnsLength} className="bg-muted/30">
        <div className="flex flex-col gap-2 py-1">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <SearchIcon className="absolute inset-y-0 my-auto left-2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder={t('page.product-properties.options.search')}
                className="pl-8 h-8"
              />
            </div>
            <Badge variant="outline">
              {t('page.product-properties.options.count', { count: filteredOptions.length })}
            </Badge>
          </div>

          {filteredOptions.length === 0
            ? (
                <p className="text-sm text-muted-foreground px-1 py-2">
                  {t('page.product-properties.options.empty')}
                </p>
              )
            : (
                <div className="max-h-64 overflow-y-auto border rounded-sm divide-y bg-background">
                  {filteredOptions.map(option => (
                    <div
                      key={option.id}
                      className="flex items-center gap-2 px-3 py-1.5 hover:bg-muted/50"
                    >
                      {option.color && (
                        <div
                          className="w-3 h-3 shrink-0 rounded-full border border-black/20"
                          style={{ backgroundColor: option.color }}
                        />
                      )}
                      <span className="flex-1 truncate text-sm">
                        {option.names[language]}
                      </span>
                      <Badge variant="outline" className="shrink-0 text-xs">
                        {option.priority}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => editOption(option, property)}
                        className="h-7 w-7 shrink-0"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOption({ ids: [option.id] })}
                        className="h-7 w-7 shrink-0 text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
        </div>
      </TableCell>
    </TableRow>
  )
}
