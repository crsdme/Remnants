import type { Column } from '@tanstack/react-table'

import type { InventoryTableRow } from '../context'
import { createColumnHelper } from '@tanstack/react-table'
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  Copy,
  Eye,
  FileSpreadsheet,
  Pencil,
  Trash,
} from 'lucide-react'

import { useMemo } from 'react'

import { useNavigate } from 'react-router-dom'
import { TableActionDropdown } from '@/components'
import { Badge, Button } from '@/components/ui'
import { formatDate } from '@/utils/helpers'
import { useLocale } from '@/utils/hooks'

import { useInventoryContext } from '../context'

const sortIcons = { asc: ArrowUp, desc: ArrowDown }

const columnHelper = createColumnHelper<InventoryTableRow>()

export function useColumns() {
  const { t, language } = useLocale()
  const { isLoading, removeInventory, exportInventoryExcel } = useInventoryContext()
  const navigate = useNavigate()

  const columns = useMemo(() => {
    function sortHeader(column: Column<InventoryTableRow, unknown>, label: string) {
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
              permission: 'inventory.read',
              onClick: async () => navigator.clipboard.writeText(item.id),
              label: t('table.copy'),
              icon: <Copy className="h-4 w-4" />,
            },
            {
              permission: 'inventory.read',
              onClick: async () => navigate(`/inventories/view/${item.seq}`),
              label: t('table.view'),
              icon: <Eye className="h-4 w-4" />,
            },
            {
              permission: 'inventory.read',
              onClick: async () => exportInventoryExcel({ id: item.id, seq: item.seq }),
              label: t('page.inventories.table.exportExcel'),
              icon: <FileSpreadsheet className="h-4 w-4" />,
            },
            ...(item.status === 'draft'
              ? [{
                  permission: 'inventory.edit',
                  onClick: async () => navigate(`/inventories/edit/${item.seq}`),
                  label: t('page.inventories.table.continue'),
                  icon: <Pencil className="h-4 w-4" />,
                }]
              : []),
            ...(item.status === 'draft'
              ? [{
                  permission: 'inventory.remove',
                  onClick: () => removeInventory({ ids: [item.id] }),
                  label: t('table.delete'),
                  icon: <Trash className="h-4 w-4" />,
                  isDestructive: true,
                  isConfirm: true,
                }]
              : []),
          ]

          return <TableActionDropdown actions={actions} />
        },
      })
    }

    return [
      columnHelper.accessor('seq', {
        id: 'seq',
        meta: {
          title: t('page.inventories.table.seq'),
          filterable: true,
          filterType: 'number',
          sortable: true,
        },
        header: ({ column }) => sortHeader(column, t('page.inventories.table.seq')),
      }),
      columnHelper.display({
        id: 'categories',
        size: 200,
        meta: {
          title: t('page.inventories.table.categories'),
          filterable: true,
          filterType: 'select',
          sortable: true,
          defaultVisible: true,
        },
        header: ({ column }) => sortHeader(column, t('page.inventories.table.categories')),
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.categories.map(category => (
              <Badge key={category.id}>
                {category.names?.[language] ?? t('page.warehouse-transactions.table.empty')}
              </Badge>
            ))}
          </div>
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
        cell: ({ row }) => (
          <Badge variant="outline">
            {row.original.warehouse?.names?.[language] ?? t('page.warehouse-transactions.table.empty')}
          </Badge>
        ),
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
  }, [exportInventoryExcel, isLoading, language, navigate, removeInventory, t])

  return columns
}
