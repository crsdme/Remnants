import { ColumnDef } from '@tanstack/react-table';

import { useTranslation } from 'react-i18next';
import { ArrowDown, ArrowUp, ChevronsUpDown, MoreHorizontal } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/view/components/ui/dropdown-menu';
import { Button, Checkbox, Badge } from '@/view/components/ui';
import formatDate from '@/utils/helpers/formatDate';
import { useCurrencyContext } from '@/utils/contexts';

export function useColumns({ setSorters }): ColumnDef<Currency>[] {
  const { t, i18n } = useTranslation();
  const currencyContext = useCurrencyContext();

  return [
    {
      id: 'select',
      meta: { title: t('component.columnMenu.columns.select') },
      header: ({ table }) => {
        const isChecked = table.getIsAllPageRowsSelected()
          ? true
          : table.getIsSomePageRowsSelected()
            ? 'indeterminate'
            : false;

        return (
          <Checkbox
            checked={isChecked}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label='Select all'
          />
        );
      },
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label='Select row'
        />
      ),
      enableSorting: false,
      enableHiding: false
    },
    {
      id: 'names',
      meta: { title: t('page.currencies.table.names') },
      header: ({ column }) => {
        const sortOrder = column.getIsSorted() || 'none';
        const icons = { asc: ArrowUp, desc: ArrowDown, none: ChevronsUpDown };
        const Icon = icons[sortOrder];

        const handleSort = () => {
          let nextSortOrder;
          if (sortOrder === 'asc') {
            column.toggleSorting(true);
            nextSortOrder = 'desc';
          } else if (sortOrder === 'desc') {
            column.clearSorting();
            nextSortOrder = 'none';
          } else if (sortOrder === 'none') {
            column.toggleSorting(false);
            nextSortOrder = 'asc';
          }
          const sortFormat = {
            asc: 1,
            desc: -1,
            none: undefined
          };

          setSorters({ names: sortFormat[nextSortOrder] });
        };

        return (
          <Button
            disabled={currencyContext.isLoading}
            variant='ghost'
            onClick={handleSort}
            className='my-2 flex items-center gap-2'
          >
            {t('page.currencies.table.names')} <Icon className='w-4 h-4' />
          </Button>
        );
      },
      accessorFn: (row) => row.names?.[i18n.language] || row.names?.['en']
    },
    {
      id: 'symbols',
      meta: { title: t('page.currencies.table.symbols') },
      header: () => t('page.currencies.table.symbols'),
      accessorFn: (row) => row.symbols?.[i18n.language] || row.symbols?.['en'],
      cell: ({ row }) => (
        <Badge variant='outline'>
          {row.original.symbols?.[i18n.language] || row.original.symbols?.['en']}
        </Badge>
      )
    },
    {
      accessorKey: 'priority',
      meta: { title: t('page.currencies.table.priority') },
      header: ({ column }) => {
        const sortOrder = column.getIsSorted() || 'none';
        const icons = { asc: ArrowUp, desc: ArrowDown, none: ChevronsUpDown };
        const Icon = icons[sortOrder];

        const handleSort = () => {
          let nextSortOrder;
          if (sortOrder === 'asc') {
            column.toggleSorting(true);
            nextSortOrder = 'desc';
          } else if (sortOrder === 'desc') {
            column.clearSorting();
            nextSortOrder = 'none';
          } else if (sortOrder === 'none') {
            column.toggleSorting(false);
            nextSortOrder = 'asc';
          }
          const sortFormat = {
            asc: 1,
            desc: -1,
            none: undefined
          };

          setSorters({ priority: sortFormat[nextSortOrder] });
        };

        return (
          <Button
            disabled={currencyContext.isLoading}
            variant='ghost'
            onClick={handleSort}
            className='my-2 flex items-center gap-2'
          >
            {t('page.currencies.table.priority')} <Icon className='w-4 h-4' />
          </Button>
        );
      },
      cell: ({ row }) => <Badge variant='outline'>{row.original.priority}</Badge>
    },
    {
      accessorKey: 'active',
      meta: { title: t('page.currencies.table.active') },
      header: t('page.currencies.table.active'),
      cell: ({ row }) => <Badge variant='outline'>{row.original.active.toString()}</Badge>
    },
    {
      accessorKey: 'createdAt',
      meta: { title: t('page.currencies.table.createdAt') },
      header: ({ column }) => {
        const sortOrder = column.getIsSorted() || 'none';
        const icons = { asc: ArrowUp, desc: ArrowDown, none: ChevronsUpDown };
        const Icon = icons[sortOrder];

        const handleSort = () => {
          let nextSortOrder;
          if (sortOrder === 'asc') {
            column.toggleSorting(true);
            nextSortOrder = 'desc';
          } else if (sortOrder === 'desc') {
            column.clearSorting();
            nextSortOrder = 'none';
          } else if (sortOrder === 'none') {
            column.toggleSorting(false);
            nextSortOrder = 'asc';
          }
          const sortFormat = {
            asc: 1,
            desc: -1,
            none: undefined
          };

          setSorters({ createdAt: sortFormat[nextSortOrder] });
        };

        return (
          <Button
            disabled={currencyContext.isLoading}
            variant='ghost'
            onClick={handleSort}
            className='my-2 flex items-center gap-2'
          >
            {t('page.currencies.table.createdAt')} <Icon className='w-4 h-4' />
          </Button>
        );
      },
      cell: ({ row }) => formatDate(row.getValue('createdAt'), 'MMMM dd, yyyy', i18n.language)
    },
    {
      accessorKey: 'updatedAt',
      meta: { title: t('page.currencies.table.updatedAt') },
      header: ({ column }) => {
        const sortOrder = column.getIsSorted() || 'none';
        const icons = { asc: ArrowUp, desc: ArrowDown, none: ChevronsUpDown };
        const Icon = icons[sortOrder];

        const handleSort = () => {
          let nextSortOrder;
          if (sortOrder === 'asc') {
            column.toggleSorting(true);
            nextSortOrder = 'desc';
          } else if (sortOrder === 'desc') {
            column.clearSorting();
            nextSortOrder = 'none';
          } else if (sortOrder === 'none') {
            column.toggleSorting(false);
            nextSortOrder = 'asc';
          }
          const sortFormat = {
            asc: 1,
            desc: -1,
            none: undefined
          };

          setSorters({ updatedAt: sortFormat[nextSortOrder] });
        };

        return (
          <Button
            disabled={currencyContext.isLoading}
            variant='ghost'
            onClick={handleSort}
            className='my-2 flex items-center gap-2'
          >
            {t('page.currencies.table.updatedAt')} <Icon className='w-4 h-4' />
          </Button>
        );
      },
      cell: ({ row }) => formatDate(row.getValue('updatedAt'), 'MMMM dd, yyyy', i18n.language)
    },
    {
      id: 'action',
      meta: {
        title: t('page.currencies.table.actions'),
        width: '70px'
      },
      enableHiding: false,
      cell: ({ row }) => {
        const currency = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant='ghost' className='h-8 w-8 p-0'>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>{t('page.currencies.table.actions')}</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(currency._id)}>
                {t('page.currencies.table.copy')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => currencyContext.toggleModal(currency)}>
                {t('page.currencies.table.edit')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => currencyContext.removeCurrency({ _id: currency._id })}
                variant='destructive'
              >
                {t('page.currencies.table.delete')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>{t('page.currencies.table.test')}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }
    }
  ];
}
