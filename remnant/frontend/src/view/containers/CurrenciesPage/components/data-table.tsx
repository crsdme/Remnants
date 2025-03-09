import { useState, useCallback } from 'react';
import { useColumns } from './columns';

import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/view/components/ui/pagination';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/view/components/ui/table';

import { Input, Skeleton } from '@/view/components/ui';
import { useRequestCurrencies } from '@/api/hooks';
import { useTranslation } from 'react-i18next';
import debounce from 'lodash.debounce';
import { ColumnVisibilityMenu } from '@/view/components/ColumnVisibilityMenu';

export function DataTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const { t, i18n } = useTranslation();

  const [pagination, setPaginationParams] = useState({
    current: 1,
    pageSize: 10
  });

  const [filters, setFilters] = useState({
    names: '',
    symbol: '',
    language: i18n.language
  });

  const [sorters, setSorters] = useState({});

  const columns = useColumns({ setSorters });

  const requestCurrencies = useRequestCurrencies({ pagination, filters, sorters });

  const currencies = requestCurrencies.data.data.currencies;
  const currenciesCount = requestCurrencies.data.data.currenciesCount;
  const totalPages = Math.ceil(currenciesCount / pagination.pageSize);

  const table = useReactTable({
    data: currencies,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection
    }
  });

  const handleSearch = useCallback(
    debounce((value) => {
      setFilters((state) => ({ ...state, ...value }));
    }, 300),
    []
  );

  return (
    <>
      <div className='w-full'>
        <div className='flex items-center max-md:flex-col py-2 gap-2'>
          <Input
            placeholder={t('currencypage.filter.names')}
            onChange={(event) => handleSearch({ names: event.target.value })}
            className='max-w-3xs max-md:max-w-full'
          />
          <Input
            placeholder={t('currencypage.filter.symbols')}
            onChange={(event) => handleSearch({ symbols: event.target.value })}
            className='max-w-3xs max-md:max-w-full'
          />
          <ColumnVisibilityMenu table={table} tableId='currency' />
        </div>
      </div>

      <Table className='rounded-lg border'>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {requestCurrencies.isLoading ? (
            Array.from({ length: 10 }).map((_, rowIndex) => (
              <TableRow key={`loading-${rowIndex}`}>
                {columns.map((column, cellIndex) => (
                  <TableCell key={`loading-${rowIndex}-${cellIndex}`}>
                    <Skeleton className='h-6 w-full' />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className='h-24 text-center'>
                No results.
              </TableCell>
            </TableRow>
          )}
          {/* {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className='h-24 text-center'>
                No results.
              </TableCell>
            </TableRow>
          )} */}
        </TableBody>
      </Table>
      <Pagination className='flex justify-end mt-4'>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href='#'
              onClick={() =>
                setPaginationParams((state) => ({
                  ...state,
                  current: Math.max(state.current - 1, 1)
                }))
              }
            />
          </PaginationItem>

          {[...Array(totalPages)].map((_, i) => (
            <PaginationItem key={i + 1}>
              <PaginationLink
                href='#'
                isActive={pagination.current === i + 1}
                onClick={() =>
                  setPaginationParams((state) => ({
                    ...state,
                    current: i + 1
                  }))
                }
              >
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))}

          {totalPages > 5 && <PaginationEllipsis />}

          <PaginationItem>
            <PaginationNext
              href='#'
              onClick={() =>
                setPaginationParams((state) => ({
                  ...state,
                  current: Math.max(state.current + 1, totalPages)
                }))
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </>
  );
}
