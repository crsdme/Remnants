import type { OrderStatusDTO } from '@remnant/shared'

import type { Column } from '@tanstack/react-table'

import { createColumnHelper } from '@tanstack/react-table'
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  Copy,
  Pencil,
  Trash,
} from 'lucide-react'

import { useMemo } from 'react'

import { TableActionDropdown } from '@/components'
import { Badge, Button, Checkbox } from '@/components/ui'
import { formatDate } from '@/utils/helpers'
import { useLocale } from '@/utils/hooks'

import { useBalanceContext } from '../context'

const sortIcons = { asc: ArrowUp, desc: ArrowDown }

const columnHelper = createColumnHelper<OrderStatusDTO>()

export function useColumns() {
  const { t, language } = useLocale()
  const { isLoading } = useBalanceContext()

  const columns = useMemo(() => {
    function sortHeader(column: Column<OrderStatusDTO, unknown>, label: string) {
      const sorted = column.getIsSorted()
      const Icon = sorted ? sortIcons[sorted] : ChevronsUpDown

      return (
        <Button
          disabled={isLoading}
          variant="ghost"
          onClick={() => column.toggleSorting()}
          className="my-2 flex items-center gap-2"
        >
          {label}
          <Icon className="w-4 h-4" />
        </Button>
      )
    }

    function selectColumn() {
      return columnHelper.display({
        id: 'select',
        size: 35,
        meta: { title: t('component.columnMenu.columns.select') },
        header: ({ table }) => {
          const isChecked = table.getIsAllPageRowsSelected()
            ? true
            : table.getIsSomePageRowsSelected()
              ? 'indeterminate'
              : false

          return (
            <Checkbox
              checked={isChecked}
              onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
              aria-label="Select all"
            />
          )
        },
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={value => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      })
    }

    function actionColumn() {
      return columnHelper.display({
        id: 'action',
        size: 85,
        meta: {
          title: t('table.actions'),
        },
        enableHiding: false,
        cell: ({ row }) => {
          const item = row.original

          const actions = [
            {
              permission: 'order.copy',
              onClick: async () => navigator.clipboard.writeText(item.id),
              label: t('table.copy'),
              icon: <Copy className="h-4 w-4" />,
            },
            {
              permission: 'order.edit',
              onClick: () => {},
              label: t('table.edit'),
              icon: <Pencil className="h-4 w-4" />,
            },
            {
              permission: 'order.delete',
              onClick: () => {},
              label: t('table.delete'),
              icon: <Trash className="h-4 w-4" />,
              isDestructive: true,
              isConfirm: true,
            },
          ]

          return <TableActionDropdown actions={actions} />
        },
      })
    }

    return [
      selectColumn(),
      columnHelper.accessor(
        row => row.names?.[language] || row.names?.en || '',
        {
          id: 'names',
          size: 150,
          meta: {
            title: t('page.orders.table.names'),
            batchEdit: true,
            batchEditType: 'textMultiLanguage',
            filterable: true,
            filterType: 'text',
            sortable: true,
            defaultVisible: true,
          },
          header: ({ column }) => sortHeader(column, t('page.orders.table.names')),
        },
      ),
      columnHelper.accessor('priority', {
        id: 'priority',
        meta: {
          title: t('page.orders.table.priority'),
          batchEdit: true,
          batchEditType: 'number',
          filterable: true,
          filterType: 'number',
          sortable: true,
        },
        header: ({ column }) => sortHeader(column, t('page.orders.table.priority')),
        cell: ({ row }) => <Badge variant="outline">{row.original.priority}</Badge>,
      }),
      columnHelper.accessor('color', {
        id: 'color',
        meta: {
          title: t('page.orders.table.color'),
          batchEdit: true,
          batchEditType: 'boolean',
          filterable: true,
          filterType: 'boolean',
          sortable: true,
        },
        header: () => t('page.orders.table.color'),
        cell: ({ row }) => {
          const color = row.original.color || '#ffffff'
          return <div className="w-6 h-6 rounded-full border border-gray-300" style={{ backgroundColor: color }} />
        },
      }),
      columnHelper.accessor('createdAt', {
        id: 'createdAt',
        meta: {
          title: t('table.createdAt'),
          filterable: true,
          filterType: 'date',
          sortable: true,
        },
        header: ({ column }) => sortHeader(column, t('table.createdAt')),
        cell: ({ row }) => formatDate(row.getValue('createdAt'), 'dd.MM.yyyy HH:mm', language),
      }),
      columnHelper.accessor('updatedAt', {
        id: 'updatedAt',
        meta: {
          title: t('table.updatedAt'),
          filterable: true,
          filterType: 'date',
          sortable: true,
        },
        header: ({ column }) => sortHeader(column, t('table.updatedAt')),
        cell: ({ row }) => formatDate(row.getValue('updatedAt'), 'dd.MM.yyyy HH:mm', language),
      }),
      actionColumn(),
    ]
  }, [isLoading, language, t])

  return columns
}
