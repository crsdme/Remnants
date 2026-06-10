import type { AuditLogPopulatedDTO } from '@remnant/shared'
import type { Column } from '@tanstack/react-table'
import { createColumnHelper } from '@tanstack/react-table'
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  Copy,
  Eye,
} from 'lucide-react'
import { useMemo } from 'react'

import { TableActionDropdown } from '@/components'
import { Badge, Button } from '@/components/ui'
import { formatDate } from '@/utils/helpers'
import { useLocale } from '@/utils/hooks'
import { useAuditLogsContext } from '../context'

const sortIcons = { asc: ArrowUp, desc: ArrowDown }
const columnHelper = createColumnHelper<AuditLogPopulatedDTO>()

export function useColumns() {
  const { t, language } = useLocale()
  const { isLoading, openModal } = useAuditLogsContext()

  const columns = useMemo(() => {
    function sortHeader(column: Column<AuditLogPopulatedDTO, unknown>, label: string) {
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
        id: 'actionMenu',
        size: 85,
        meta: {
          title: t('table.actions'),
        },
        enableHiding: false,
        cell: ({ row }) => {
          const item = row.original

          const actions = [
            {
              permission: 'audit-log.copy',
              onClick: () => void navigator.clipboard.writeText(item.id),
              label: t('table.copy'),
              icon: <Copy className="h-4 w-4" />,
            },
            {
              permission: 'audit-log.view',
              onClick: () => openModal(item),
              label: t('table.view'),
              icon: <Eye className="h-4 w-4" />,
            },
          ]

          return <TableActionDropdown actions={actions} />
        },
      })
    }

    return [
      columnHelper.display({
        id: 'resourseInfo',
        meta: {
          title: t('page.audit-logs.table.resourceInfo'),
        },
        header: () => t('page.audit-logs.table.resourceInfo'),
        cell: ({ row }) => {
          const resource = row.original.resource as Record<string, any>

          switch (row.original.resourceType) {
            case 'product':
              return (
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{`#${resource.seq}`}</Badge>
                  <Badge variant="outline">{resource.names?.[language]}</Badge>
                </div>
              )
            case 'order':
              return <p>{`${resource.seq} ${resource.client.name} ${resource.client.lastName} ${resource.client.middleName}`}</p>
            default:
              return <p>{resource.name}</p>
          }
        },
      }),
      columnHelper.accessor('resourceType', {
        id: 'resourceType',
        meta: {
          title: t('page.audit-logs.table.resourceType'),
        },
        header: () => t('page.audit-logs.table.resourceType'),
        cell: ({ row }) => <Badge variant="outline">{t(`page.audit-logs.table.resourceType.${row.original.resourceType}`)}</Badge>,
      }),
      columnHelper.accessor('action', {
        id: 'action',
        meta: {
          title: t('page.audit-logs.table.action'),
        },
        header: () => t('page.audit-logs.table.action'),
        cell: ({ row }) => <Badge variant="outline">{t(`page.audit-logs.table.action.${row.original.action}`)}</Badge>,
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
  }, [language, isLoading, openModal, t])
  return columns
}
