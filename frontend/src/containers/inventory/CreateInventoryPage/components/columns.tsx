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
import { useCreateInventoryContext } from '@/contexts'
import { formatDate } from '@/utils/helpers'

const sortIcons = { asc: ArrowUp, desc: ArrowDown }

export function useColumns() {
  const { t, i18n } = useTranslation()
  const { isLoading } = useCreateInventoryContext()

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
              permission: 'warehouse-transaction.copy',
              onClick: () => navigator.clipboard.writeText(item.id),
              label: t('table.copy'),
              icon: <Copy className="h-4 w-4" />,
            },
            {
              permission: 'warehouse-transaction.edit',
              onClick: async () => {},
              label: t('table.edit'),
              icon: <Pencil className="h-4 w-4" />,
            },
            ...(item.status === 'awaiting'
              ? [{
                  permission: 'warehouse-transaction.receive',
                  onClick: async () => {},
                  label: t('table.receive'),
                  icon: <Check className="h-4 w-4" />,
                }]
              : []),
            {
              permission: 'warehouse-transaction.delete',
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
          title: t('page.products.table.seq'),
          filterable: true,
          filterType: 'number',
          sortable: true,
        },
        cell: ({ row }) => row.original.seq,
      },
      {
        id: 'type',
        size: 150,
        meta: {
          title: t('page.warehouse-transactions.table.type'),
          filterable: true,
          filterType: 'select',
          sortable: true,
          defaultVisible: true,
        },
        header: ({ column }) => sortHeader(column, t('page.warehouse-transactions.table.type')),
        cell: ({ row }) => {
          const badgeType = {
            in: 'success',
            out: 'destructive',
            transfer: 'default',
          }
          return <Badge variant={badgeType[row.original.type]}>{t(`page.warehouse-transactions.table.type.${row.original.type.toLowerCase()}`)}</Badge>
        },
      },
      {
        id: 'fromWarehouse',
        accessorKey: 'fromWarehouse',
        meta: {
          title: t('page.warehouse-transactions.table.fromWarehouse'),
          filterable: true,
          filterType: 'select',
        },
        header: () => t('page.warehouse-transactions.table.fromWarehouse'),
        cell: ({ row }) => <Badge variant="outline">{row.original?.fromWarehouse?.names[i18n.language] || t('page.warehouse-transactions.table.empty')}</Badge>,
      },
      {
        id: 'toWarehouse',
        accessorKey: 'toWarehouse',
        meta: {
          title: t('page.warehouse-transactions.table.toWarehouse'),
          filterable: true,
          filterType: 'select',
        },
        header: () => t('page.warehouse-transactions.table.toWarehouse'),
        cell: ({ row }) => <Badge variant="outline">{row.original?.toWarehouse?.names[i18n.language] || t('page.warehouse-transactions.table.empty')}</Badge>,
      },
      {
        id: 'status',
        accessorKey: 'status',
        meta: {
          title: t('page.warehouse-transactions.table.status'),
          filterable: true,
          filterType: 'select',
        },
        header: () => t('page.warehouse-transactions.table.status'),
        cell: ({ row }) => {
          const badgeType = {
            draft: 'default',
            confirmed: 'success',
            cancelled: 'destructive',
            received: 'success',
          }
          return <Badge variant={badgeType[row.original.status]}>{t(`page.warehouse-transactions.table.status.${row.original.status.toLowerCase()}`)}</Badge>
        },
      },
      {
        id: 'comment',
        accessorKey: 'comment',
        meta: {
          title: t('page.warehouse-transactions.table.comment'),
        },
        header: () => t('page.warehouse-transactions.table.comment'),
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
        cell: ({ row }) => formatDate(row.getValue('createdAt'), 'MMMM dd, yyyy', i18n.language),
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
        cell: ({ row }) => formatDate(row.getValue('updatedAt'), 'MMMM dd, yyyy', i18n.language),
      },
      actionColumn(),
    ]
  }, [i18n.language])
  return columns
}
