import type { Column } from '@tanstack/react-table'
import type { ViewInventoryTableRow } from '../context'
import { createColumnHelper } from '@tanstack/react-table'
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  Copy,
  Eye,
  Pencil,
  Trash,
} from 'lucide-react'

import { useMemo } from 'react'

import { useNavigate } from 'react-router-dom'
import { TableActionDropdown } from '@/components'
import { Badge, Button } from '@/components/ui'
import { formatDate } from '@/utils/helpers'
import { useLocale } from '@/utils/hooks'
import { useViewInventoryContext } from '../context'

const sortIcons = { asc: ArrowUp, desc: ArrowDown }

const columnHelper = createColumnHelper<ViewInventoryTableRow>()

export function useColumns() {
  const { t, language } = useLocale()
  const { isLoading } = useViewInventoryContext()
  const navigate = useNavigate()

  const columns = useMemo(() => {
    function sortHeader(column: Column<ViewInventoryTableRow, unknown>, label: string) {
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
              permission: 'inventory.copy',
              onClick: async () => navigator.clipboard.writeText(item.id),
              label: t('table.copy'),
              icon: <Copy className="h-4 w-4" />,
            },
            {
              permission: 'inventory.edit',
              onClick: async () => {},
              label: t('table.edit'),
              icon: <Pencil className="h-4 w-4" />,
            },
            {
              permission: 'inventory.view',
              onClick: async () => navigate(`/inventories/view/${item.seq}`),
              label: t('table.view'),
              icon: <Eye className="h-4 w-4" />,
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
              isConfirm: true,
            },
          ]

          return <TableActionDropdown actions={actions} />
        },
      })
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

    function warehouseLabel(row: ViewInventoryTableRow) {
      const w = row.warehouse
      if (w === undefined || w === null)
        return t('page.warehouse-transactions.table.empty')
      if (typeof w === 'string')
        return w
      return w.names?.[language] ?? t('page.warehouse-transactions.table.empty')
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
      columnHelper.display({
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
        cell: ({ row }) => (
          <Badge>
            {row.original.category?.names?.[language] ?? t('page.warehouse-transactions.table.empty')}
          </Badge>
        ),
      }),
      columnHelper.display({
        id: 'warehouse',
        meta: {
          title: t('page.inventories.table.warehouse'),
          filterable: true,
          filterType: 'select',
        },
        header: () => t('page.inventories.table.warehouse'),
        cell: ({ row }) => <Badge variant="outline">{warehouseLabel(row.original)}</Badge>,
      }),
      columnHelper.accessor('status', {
        id: 'status',
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
          } as const
          const status = row.original.status
          return (
            <Badge variant={badgeType[status as keyof typeof badgeType] ?? 'default'}>
              {t(`page.inventories.table.status.${status.toLowerCase()}`)}
            </Badge>
          )
        },
      }),
      columnHelper.accessor('comment', {
        id: 'comment',
        meta: {
          title: t('page.inventories.table.comment'),
        },
        header: () => t('page.inventories.table.comment'),
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
  }, [isLoading, language, navigate, t])

  return columns
}
