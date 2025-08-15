import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  Copy,
  Pencil,
  Trash,
} from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { TableActionDropdown } from '@/components'
import { Badge, Button } from '@/components/ui'
import { useInventoryContext } from '@/contexts'
import { formatDate } from '@/utils/helpers'

const sortIcons = { asc: ArrowUp, desc: ArrowDown }

export function useColumns() {
  const { t, i18n } = useTranslation()
  const { isLoading } = useInventoryContext()

  const columns = useMemo(() => {
    function sortHeader(column, label) {
      const Icon = sortIcons[column.getIsSorted() || undefined] || ChevronsUpDown

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

    function actionColumn() {
      return ({
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
              permission: 'inventory.copy',
              onClick: () => navigator.clipboard.writeText(item.id),
              label: t('table.copy'),
              icon: <Copy className="h-4 w-4" />,
            },
            {
              permission: 'inventory.edit',
              onClick: async () => {},
              label: t('table.edit'),
              icon: <Pencil className="h-4 w-4" />,
            },
            ...(item.status === 'awaiting'
              ? [{
                  permission: 'inventory.receive',
                  onClick: async () => {},
                  label: t('table.receive'),
                  icon: <Check className="h-4 w-4" />,
                }]
              : []),
            {
              permission: 'inventory.delete',
              onClick: () => {},
              label: t('table.delete'),
              icon: <Trash className="h-4 w-4" />,
              isDestructive: true,
            },
          ]

          return <TableActionDropdown actions={actions} />
        },
      })
    }

    function expanderColumn() {
      return ({
        id: 'expander',
        header: '',
        cell: ({ row }) => {
          return (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => row.toggleExpanded()}
              style={{ width: 24, height: 24, padding: 0 }}
            >
              {row.getIsExpanded()
                ? <ChevronDown size={16} />
                : <ChevronRight size={16} />}
            </Button>
          )
        },
        size: 24,
        enableSorting: false,
        enableHiding: false,
      })
    }

    return [
      expanderColumn(),
      {
        id: 'seq',
        meta: {
          title: t('page.inventories.table.seq'),
          filterable: true,
          filterType: 'number',
          sortable: true,
        },
        cell: ({ row }) => row.original.seq,
      },
      {
        id: 'category',
        size: 150,
        meta: {
          title: t('page.inventories.table.category'),
          filterable: true,
          filterType: 'select',
          sortable: true,
          defaultVisible: true,
        },
        header: ({ column }) => sortHeader(column, t('page.inventories.table.category')),
        cell: ({ row }) => <Badge>{row.original.category?.names[i18n.language]}</Badge>,
      },
      {
        id: 'warehouse',
        accessorKey: 'warehouse',
        meta: {
          title: t('page.inventories.table.warehouse'),
          filterable: true,
          filterType: 'select',
        },
        header: () => t('page.inventories.table.warehouse'),
        cell: ({ row }) => <Badge variant="outline">{row.original?.warehouse?.names[i18n.language]}</Badge>,
      },
      {
        id: 'status',
        accessorKey: 'status',
        meta: {
          title: t('page.inventories.table.status'),
          filterable: true,
          filterType: 'select',
        },
        header: () => t('page.inventories.table.status'),
        cell: ({ row }) => {
          const badgeType = {
            draft: 'default',
            confirmed: 'success',
            cancelled: 'destructive',
            received: 'success',
          }
          return <Badge variant={badgeType[row.original.status]}>{t(`page.inventories.table.status.${row.original.status.toLowerCase()}`)}</Badge>
        },
      },
      {
        id: 'comment',
        accessorKey: 'comment',
        meta: {
          title: t('page.inventories.table.comment'),
        },
        header: () => t('page.inventories.table.comment'),
      },
      {
        id: 'createdAt',
        accessorKey: 'createdAt',
        meta: {
          title: t('table.createdAt'),
          filterable: true,
          filterType: 'date',
          sortable: true,
        },
        header: ({ column }) => sortHeader(column, t('table.createdAt')),
        cell: ({ row }) => formatDate(row.getValue('createdAt'), 'dd.MM.yyyy HH:mm', i18n.language),
      },
      {
        id: 'updatedAt',
        accessorKey: 'updatedAt',
        meta: {
          title: t('table.updatedAt'),
          filterable: true,
          filterType: 'date',
          sortable: true,
        },
        header: ({ column }) => sortHeader(column, t('table.updatedAt')),
        cell: ({ row }) => formatDate(row.getValue('updatedAt'), 'dd.MM.yyyy HH:mm', i18n.language),
      },
      actionColumn(),
    ]
  }, [i18n.language])
  return columns
}
