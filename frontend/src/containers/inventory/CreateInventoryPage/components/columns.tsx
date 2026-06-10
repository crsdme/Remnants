import type { Column } from '@tanstack/react-table'

import type { WarehouseTransactionTableRow } from '../../../warehouseTransaction/WarehouseTransactionsPage/context'

import { createColumnHelper } from '@tanstack/react-table'
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

import { TableActionDropdown } from '@/components'
import { Badge, Button } from '@/components/ui'
import { formatDate } from '@/utils/helpers'
import { useLocale } from '@/utils/hooks'

import { useCreateInventoryContext } from '../context'

const sortIcons = { asc: ArrowUp, desc: ArrowDown }

const columnHelper = createColumnHelper<WarehouseTransactionTableRow>()

export function useColumns() {
  const { t, language } = useLocale()
  const { isLoading } = useCreateInventoryContext()

  const columns = useMemo(() => {
    function sortHeader(column: Column<WarehouseTransactionTableRow, unknown>, label: string) {
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

    function expanderColumn() {
      return columnHelper.display({
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
              permission: 'warehouse-transaction.copy',
              onClick: async () => navigator.clipboard.writeText(item.id),
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
              isConfirm: true,
            },
          ]

          return <TableActionDropdown actions={actions} />
        },
      })
    }

    return [
      expanderColumn(),
      columnHelper.display({
        id: 'seq',
        meta: {
          title: t('page.products.table.seq'),
          filterable: true,
          filterType: 'number',
          sortable: true,
        },
        cell: ({ row }) => row.original.seq,
      }),
      columnHelper.accessor('type', {
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
          } as const
          return (
            <Badge variant={badgeType[row.original.type as keyof typeof badgeType] ?? 'default'}>
              {t(`page.warehouse-transactions.table.type.${row.original.type.toLowerCase()}`)}
            </Badge>
          )
        },
      }),
      columnHelper.display({
        id: 'fromWarehouse',
        meta: {
          title: t('page.warehouse-transactions.table.fromWarehouse'),
          filterable: true,
          filterType: 'select',
        },
        header: () => t('page.warehouse-transactions.table.fromWarehouse'),
        cell: ({ row }) => {
          const fw = row.original.fromWarehouse
          const label = typeof fw === 'object' && fw !== null
            ? (fw.names?.[language] ?? t('page.warehouse-transactions.table.empty'))
            : t('page.warehouse-transactions.table.empty')
          return <Badge variant="outline">{label}</Badge>
        },
      }),
      columnHelper.display({
        id: 'toWarehouse',
        meta: {
          title: t('page.warehouse-transactions.table.toWarehouse'),
          filterable: true,
          filterType: 'select',
        },
        header: () => t('page.warehouse-transactions.table.toWarehouse'),
        cell: ({ row }) => {
          const tw = row.original.toWarehouse
          const label = typeof tw === 'object' && tw !== null
            ? (tw.names?.[language] ?? t('page.warehouse-transactions.table.empty'))
            : t('page.warehouse-transactions.table.empty')
          return <Badge variant="outline">{label}</Badge>
        },
      }),
      columnHelper.accessor('status', {
        id: 'status',
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
          } as const
          return (
            <Badge variant={badgeType[row.original.status as keyof typeof badgeType] ?? 'default'}>
              {t(`page.warehouse-transactions.table.status.${row.original.status.toLowerCase()}`)}
            </Badge>
          )
        },
      }),
      columnHelper.accessor('comment', {
        id: 'comment',
        meta: {
          title: t('page.warehouse-transactions.table.comment'),
        },
        header: () => t('page.warehouse-transactions.table.comment'),
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
