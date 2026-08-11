import { flexRender, getCoreRowModel, getExpandedRowModel, useReactTable } from '@tanstack/react-table'

import { Fragment, useState } from 'react'
import { useProcurementQuery } from '@/api/hooks'
import { ColumnVisibilityMenu, TablePagination } from '@/components'
import { Skeleton, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui'

import { useListQueryState, useLocale } from '@/utils/hooks'
import { useColumns } from './columns'

export function DataTable() {
  const { t } = useLocale()
  const [columnVisibility, setColumnVisibility] = useState({})

  const {
    pagination,
    setPagination,
    sorting,
    setSorting,
    filters,
    sorters,
  } = useListQueryState({})

  const columns = useColumns()

  const { procurementsCount, isLoading, isFetching } = useProcurementQuery(
    { pagination, filters, sorters },
    { options: { placeholderData: prevData => prevData } },
  )

  const table = useReactTable({
    data: [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: setSorting,
    manualSorting: true,
    enableSortingRemoval: true,
    state: {
      sorting,
      columnVisibility,
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
          {/* {row.getIsExpanded() && (
            <SubRowItems
              procurementId={row.original.id}
              columnsLength={columns.length}
              language={i18n.language}
            />
          )} */}
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
        <div className="flex gap-2">
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
        changePagination={setPagination}
        totalCount={procurementsCount}
      />
    </>
  )
}

// function SubRowItems({ procurementId, columnsLength, language }) {
//   const { data, isLoading, isFetching, error } = useProcurementItemsQuery(
//     { filters: { procurementId } },
//     { options: { placeholderData: prevData => prevData } },
//   )

//   const itemsData = data?.data?.data?.items ?? []

//   if (isLoading || isFetching) {
//     return (
//       <TableRow className="animate-pulse">
//         <TableCell colSpan={columnsLength}>
//           <Skeleton className="h-8 w-full" />
//         </TableCell>
//       </TableRow>
//     )
//   }
//   if (error) {
//     return (
//       <TableRow>
//         <TableCell colSpan={columnsLength}>ERROR</TableCell>
//       </TableRow>
//     )
//   }
//   return (
//     <TableRow>
//       <TableCell colSpan={columnsLength} className="w-full">
//         <div className="flex flex-wrap gap-2 w-full">
//           {itemsData.map(item => (
//             <Badge key={item.id}>
//               {`${item.product.names[language]} - ${item.quantity}`}
//             </Badge>
//           ))}
//         </div>
//       </TableCell>
//     </TableRow>
//   )
// }
