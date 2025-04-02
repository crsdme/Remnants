import { useCallback, useState } from 'react';

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

import { useTranslation } from 'react-i18next';
import Papa from 'papaparse';
import debounce from 'lodash.debounce';

import { DataTableFilters } from './data-table-filters';
import { useColumns } from './columns';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/view/components/ui/table';
import { Skeleton } from '@/view/components/ui/skeleton';
import TableSelectionDropdown from '@/view/components/TableSelectionDropdown';
import TablePagination from '@/view/components/TablePagination';
import { ColumnVisibilityMenu } from '@/view/components/ColumnVisibilityMenu';
import { useRequestCurrencies } from '@/api/hooks';

export function DataTable() {
  const { t, i18n } = useTranslation();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [sorters, setSorters] = useState({});
  const columns = useColumns({ setSorters });

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10
  });

  const [filters, setFilters] = useState({
    names: '',
    symbols: '',
    active: [],
    createdAt: { from: undefined, to: undefined },
    language: i18n.language
  });

  const requestCurrencies = useRequestCurrencies(
    { pagination, filters, sorters },
    { options: { placeholderData: (prevData) => prevData } }
  );

  const isLoading = requestCurrencies.isLoading || requestCurrencies.isFetching;
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

  const changePagination = useCallback(
    debounce((value) => {
      setPagination((state) => ({ ...state, ...value }));
    }, 300),
    []
  );

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

  const renderSkeletonRows = () => {
    const visibleColumns = table.getVisibleFlatColumns();

    return Array(pagination.pageSize)
      .fill(0)
      .map((_, index) => (
        <TableRow key={`skeleton-${index}`} className='animate-pulse'>
          {visibleColumns.map((column) => (
            <TableCell key={`skeleton-cell-${column.id}`}>
              <Skeleton className={`h-8 'w-full`} />
            </TableCell>
          ))}
        </TableRow>
      ));
  };

  const renderTableBody = () => {
    if (isLoading) return renderSkeletonRows();

    if (table.getRowModel().rows?.length) {
      return table.getRowModel().rows.map((row) => (
        <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
          {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          ))}
        </TableRow>
      ));
    }

    return (
      <TableRow>
        <TableCell colSpan={columns.length} className='h-24 text-center'>
          {t('page.currencies.table.noResults')}
        </TableCell>
      </TableRow>
    );
  };

  return (
    <>
      <div className='w-full'>
        <div className='flex justify-between items-center max-md:flex-col gap-2'>
          <DataTableFilters filters={filters} setFilters={setFilters} />

          <div className='flex gap-2'>
            <TableSelectionDropdown
              selectedCount={Object.keys(rowSelection).length}
              onExport={handleBatchExport}
            />
            <ColumnVisibilityMenu table={table} tableId='currency' />
          </div>
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
          <TableBody>{renderTableBody()}</TableBody>
        </Table>
      </div>
      <TablePagination
        pagination={pagination}
        totalPages={totalPages}
        changePagination={changePagination}
        selectedCount={Object.keys(rowSelection).length}
        totalCount={currenciesCount}
      />
    </>
  );
}
