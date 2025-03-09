import { ColumnDef } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import formatDate from '@/utils/helpers/formatDate';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/view/components/ui/dropdown-menu';
import { useCurrencyContext } from '@/utils/contexts';

import { MoreHorizontal, ArrowUpDown, ArrowDown, ArrowUp } from 'lucide-react';

import { Button } from '@/view/components/ui';

export function useColumns({ setSorters }): ColumnDef<Currency>[] {
  const { t, i18n } = useTranslation();
  const currencyContext = useCurrencyContext();

  return [
    {
      id: 'names',
      header: ({ column }) => {
        const sortOrder = column.getIsSorted() || 'none';
        const icons = { asc: ArrowUp, desc: ArrowDown, none: ArrowUpDown };
        const Icon = icons[sortOrder];

        const handleSort = () => {
          if (sortOrder === 'asc') {
            column.toggleSorting(true);
          } else if (sortOrder === 'desc') {
            column.clearSorting();
          } else if (sortOrder === 'none') {
            column.toggleSorting(false);
          }
          const sortFormat = {
            asc: 1,
            desc: -1
          };

          setSorters({ updatedAt: sortFormat[sortOrder] });
        };

        return (
          <Button variant='ghost' onClick={handleSort} className='m-2 flex items-center gap-2'>
            {t('table.names')} <Icon className='w-4 h-4' />
          </Button>
        );
      },
      accessorFn: (row) => row.names?.[i18n.language] || row.names?.['en']
    },
    {
      id: 'symbols',
      header: () => t('table.symbols'),
      accessorFn: (row) => row.symbols?.[i18n.language] || row.symbols?.['en']
    },
    {
      accessorKey: 'priority',
      header: ({ column }) => {
        const sortOrder = column.getIsSorted() || 'none';
        const icons = { asc: ArrowUp, desc: ArrowDown, none: ArrowUpDown };
        const Icon = icons[sortOrder];

        const handleSort = () => {
          if (sortOrder === 'asc') {
            column.toggleSorting(true);
          } else if (sortOrder === 'desc') {
            column.clearSorting();
          } else if (sortOrder === 'none') {
            column.toggleSorting(false);
          }
          const sortFormat = {
            asc: 1,
            desc: -1
          };

          setSorters({ updatedAt: sortFormat[sortOrder] });
        };

        return (
          <Button variant='ghost' onClick={handleSort} className='m-2 flex items-center gap-2'>
            {t('table.priority')} <Icon className='w-4 h-4' />
          </Button>
        );
      }
    },
    {
      accessorKey: 'active',
      header: t('table.active')
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => {
        const sortOrder = column.getIsSorted() || 'none';
        const icons = { asc: ArrowUp, desc: ArrowDown, none: ArrowUpDown };
        const Icon = icons[sortOrder];

        const handleSort = () => {
          if (sortOrder === 'asc') {
            column.toggleSorting(true);
          } else if (sortOrder === 'desc') {
            column.clearSorting();
          } else if (sortOrder === 'none') {
            column.toggleSorting(false);
          }
          const sortFormat = {
            asc: 1,
            desc: -1
          };

          setSorters({ updatedAt: sortFormat[sortOrder] });
        };

        return (
          <Button variant='ghost' onClick={handleSort} className='m-2 flex items-center gap-2'>
            {t('table.createdAt')} <Icon className='w-4 h-4' />
          </Button>
        );
      },
      cell: ({ row }) => formatDate(row.getValue('createdAt'))
    },
    {
      accessorKey: 'updatedAt',
      header: ({ column }) => {
        const sortOrder = column.getIsSorted() || 'none';
        const icons = { asc: ArrowUp, desc: ArrowDown, none: ArrowUpDown };
        const Icon = icons[sortOrder];

        const handleSort = () => {
          if (sortOrder === 'asc') {
            column.toggleSorting(true);
          } else if (sortOrder === 'desc') {
            column.clearSorting();
          } else if (sortOrder === 'none') {
            column.toggleSorting(false);
          }
          const sortFormat = {
            asc: 1,
            desc: -1
          };

          setSorters({ updatedAt: sortFormat[sortOrder] });
        };

        return (
          <Button variant='ghost' onClick={handleSort} className='m-2 flex items-center gap-2'>
            {t('table.updatedAt')} <Icon className='w-4 h-4' />
          </Button>
        );
      },
      cell: ({ row }) => formatDate(row.getValue('updatedAt'))
    },
    {
      id: 'action',
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
              <DropdownMenuLabel>{t('currency.columns.actions')}</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(currency._id)}>
                {t('currency.columns.copy')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => currencyContext.toggleModal(currency)}>
                {t('currency.columns.edit')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => currencyContext.removeCurrency({ _id: currency._id })}
              >
                {t('currency.columns.delete')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>{t('currency.columns.test')}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }
    }
  ];
}
