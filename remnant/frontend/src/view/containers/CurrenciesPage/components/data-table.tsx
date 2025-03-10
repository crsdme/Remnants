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

import { Select, SelectTrigger, SelectContent, SelectItem } from '@/view/components/ui/select';

import { Input } from '@/view/components/ui';
import { useRequestCurrencies } from '@/api/hooks';
import { useTranslation } from 'react-i18next';
import debounce from 'lodash.debounce';
import { ColumnVisibilityMenu } from '@/view/components/ColumnVisibilityMenu';
import TableSelectionDropdown from '@/view/components/TableSelectionDropdown';
import Papa from 'papaparse';

export function DataTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const { t, i18n } = useTranslation();

  const [pagination, setPagination] = useState({
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

  const requestCurrencies = useRequestCurrencies(
    { pagination, filters, sorters },
    { options: { keepPreviousData: true } }
  );

  const currencies = requestCurrencies?.data?.data?.currencies || [];
  const currenciesCount = requestCurrencies?.data?.data?.currenciesCount || 0;
  const totalPages = Math.ceil(currenciesCount / pagination.pageSize);

  const table = useReactTable({
    data: currencies,
    columns,
    onSortingChange: setSorting,
    manualPagination: true,
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
      rowSelection,
      pagination: {
        pageIndex: pagination.current - 1,
        pageSize: pagination.pageSize
      }
    }
  });

  const handleSearch = useCallback(
    debounce((value) => {
      setFilters((state) => ({ ...state, ...value }));
    }, 300),
    []
  );

  const changePagination = useCallback(
    debounce((value) => {
      setPagination((state) => ({ ...state, ...value }));
    }, 300),
    []
  );

  const handleBatchDelete = () => {
    console.log('11111');
    setRowSelection({});
  };

  const handleBatchExport = () => {
    const filteredData = currencies.filter((_, index) => rowSelection[index]);
    const formatedCurrencies = filteredData.map((item) => ({
      names: item.names[i18n.language],
      symbols: item.symbols[i18n.language],
      priority: item.priority,
      active: item.active,
      updatedAt: item.updatedAt,
      createdAt: item.createdAt
    }));

    const csv = Papa.unparse(formatedCurrencies);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setRowSelection({});
  };

  const handleBatchCopy = () => {
    console.log('11111');
    setRowSelection({});
  };

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
          <TableSelectionDropdown
            selectedCount={Object.keys(rowSelection).length}
            onDelete={handleBatchDelete}
            onCopy={handleBatchCopy}
            onExport={handleBatchExport}
          />
        </div>
      </div>
      <div className='border rounded-sm'>
        <Table>
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
            {table.getRowModel().rows?.length ? (
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
          </TableBody>
        </Table>
      </div>

      <div className='flex justify-between items-center mt-4'>
        <span className='text-sm text-muted-foreground'>
          {t('pagination.selected', {
            selected: Object.keys(rowSelection).length,
            total: currenciesCount
          })}
        </span>
        <div className='flex justify-end items-center gap-4'>
          <Select onValueChange={(value) => changePagination({ pageSize: Number(value) })}>
            <SelectTrigger>{pagination.pageSize}</SelectTrigger>
            <SelectContent>
              <SelectItem value='10'>10</SelectItem>
              <SelectItem value='20'>20</SelectItem>
              <SelectItem value='50'>50</SelectItem>
            </SelectContent>
          </Select>
          <span className='text-sm text-muted-foreground w-40'>
            {t('pagination.current', { current: pagination.current, total: totalPages })}
          </span>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href='#'
                  onClick={() =>
                    changePagination({
                      current: Math.max(pagination.current - 1, 1)
                    })
                  }
                  aria-disabled={pagination.current <= 1}
                  tabIndex={pagination.current <= 1 ? -1 : undefined}
                  className={pagination.current <= 1 ? 'pointer-events-none opacity-50' : undefined}
                />
              </PaginationItem>

              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i + 1}>
                  <PaginationLink
                    href='#'
                    isActive={pagination.current === i + 1}
                    onClick={() =>
                      changePagination({
                        current: i + 1
                      })
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
                    changePagination({
                      current: Math.max(pagination.current + 1, totalPages)
                    })
                  }
                  aria-disabled={pagination.current > 1}
                  tabIndex={pagination.current > 1 ? -1 : undefined}
                  className={pagination.current > 1 ? 'pointer-events-none opacity-50' : undefined}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </>
  );
}
