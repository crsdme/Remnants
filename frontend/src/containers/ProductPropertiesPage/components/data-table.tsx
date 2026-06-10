import type { ProductPropertyDTO, ProductPropertyOptionDTO } from '@remnant/shared'
import type { Row } from '@tanstack/react-table'
import { flexRender, getCoreRowModel, getExpandedRowModel, useReactTable } from '@tanstack/react-table'
import { Pencil, Trash2 } from 'lucide-react'
import { Fragment, useState } from 'react'

import { useProductPropertyOptionQuery, useProductPropertyQuery } from '@/api/hooks'
import { ColumnVisibilityMenu, TablePagination } from '@/components'
import { Badge, Button, Skeleton, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui'
import { useListQueryState, useLocale } from '@/utils/hooks'

import { useProductPropertiesContext } from '../context'
import { useColumns } from './columns'
import { DataTableFilters } from './data-table-filters'

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
      {row.getIsExpanded() && row.original.options?.length > 0 && (
        <SubRowOptions
          property={row.original}
          optionIds={row.original.options}
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

function SubRowOptions({ property, optionIds, columnsLength, editOption, removeOption }:
{
  property: ProductPropertyDTO
  optionIds: string[]
  columnsLength: number
  editOption: (option: ProductPropertyOptionDTO, property: ProductPropertyDTO) => void
  removeOption: ({ ids }: { ids: string[] }) => void
}) {
  const { language } = useLocale()
  const enabled = !!optionIds.length

  const { productPropertyOptions, isLoading, isFetching, error } = useProductPropertyOptionQuery(
    { pagination: { full: true }, filters: { ids: optionIds, language } },
    { options: { placeholderData: prevData => prevData } },
  )

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
          {productPropertyOptions.map(option => (
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
                onClick={() => editOption(option, property)}
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
