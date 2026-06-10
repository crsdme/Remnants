import type { DeliveryServiceDTO } from '@remnant/shared'
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
import { Badge, Button } from '@/components/ui'
import { formatDate } from '@/utils/helpers'
import { useLocale } from '@/utils/hooks'
import { useDeliveryServiceContext } from '../context'

const sortIcons = { asc: ArrowUp, desc: ArrowDown }
const columnHelper = createColumnHelper<DeliveryServiceDTO>()

export function useColumns() {
  const { t, language } = useLocale()
  const { isLoading, openModal, removeDeliveryService } = useDeliveryServiceContext()

  const columns = useMemo(() => {
    function sortHeader(column: Column<DeliveryServiceDTO, unknown>, label: string) {
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
              permission: 'delivery-service.copy',
              onClick: async () => navigator.clipboard.writeText(item.id),
              label: t('table.copy'),
              icon: <Copy className="h-4 w-4" />,
            },
            {
              permission: 'delivery-service.edit',
              onClick: () => openModal(item),
              label: t('table.edit'),
              icon: <Pencil className="h-4 w-4" />,
            },
            {
              permission: 'delivery-service.delete',
              onClick: () => removeDeliveryService({ ids: [item.id] }),
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
      columnHelper.accessor(row => row.names?.[language] || row.names?.en, {
        id: 'names',
        size: 150,
        meta: {
          title: t('page.delivery-services.table.names'),
          batchEdit: true,
          batchEditType: 'textMultiLanguage',
          filterable: true,
          filterType: 'text',
          sortable: true,
          defaultVisible: true,
        },
        header: ({ column }) => sortHeader(column, t('page.delivery-services.table.names')),
      }),
      columnHelper.accessor('priority', {
        id: 'priority',
        meta: {
          title: t('page.delivery-services.table.priority'),
          batchEdit: true,
          batchEditType: 'number',
          filterable: true,
          filterType: 'number',
          sortable: true,
        },
        header: ({ column }) => sortHeader(column, t('page.delivery-services.table.priority')),
        cell: ({ row }) => <Badge variant="outline">{row.original.priority}</Badge>,
      }),
      columnHelper.accessor('type', {
        id: 'type',
        meta: {
          title: t('page.delivery-services.table.type'),
          batchEdit: true,
          batchEditType: 'text',
          filterable: true,
          filterType: 'text',
          sortable: true,
        },
        header: ({ column }) => sortHeader(column, t('page.delivery-services.table.type')),
        cell: ({ row }) => <Badge variant="outline">{row.original.type}</Badge>,
      }),
      columnHelper.accessor('color', {
        id: 'color',
        meta: {
          title: t('page.delivery-services.table.color'),
          batchEdit: true,
          batchEditType: 'boolean',
          filterable: true,
          filterType: 'boolean',
          sortable: true,
        },
        header: t('page.delivery-services.table.color'),
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
  }, [language, isLoading, openModal, removeDeliveryService, t])
  return columns
}
