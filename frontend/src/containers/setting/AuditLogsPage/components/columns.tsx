import type { AuditLogPopulatedDTO } from '@remnant/shared'
import type { Column } from '@tanstack/react-table'
import { createColumnHelper } from '@tanstack/react-table'
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  Copy,
  ExternalLink,
  Eye,
} from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'

import { AuditChangesList, TableActionDropdown } from '@/components'
import { Badge, Button } from '@/components/ui'
import { formatDate } from '@/utils/helpers'
import { useLocale } from '@/utils/hooks'
import { useAuditLogsContext } from '../context'
import { getAuditLogEntityPath } from '../utils'

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
          const entityPath = getAuditLogEntityPath(item)

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
            ...(entityPath
              ? [{
                  permission: 'audit-log.view',
                  type: 'link' as const,
                  link: entityPath,
                  label: t('page.audit-logs.table.openEntity'),
                  icon: <ExternalLink className="h-4 w-4" />,
                }]
              : []),
          ]

          return <TableActionDropdown actions={actions} />
        },
      })
    }

    return [
      columnHelper.accessor('resourceType', {
        id: 'resourceType',
        meta: {
          title: t('page.audit-logs.table.resourceType'),
        },
        header: () => t('page.audit-logs.table.resourceType'),
        cell: ({ row }) => (
          <Badge variant="outline">
            {t(`page.audit-logs.table.resourceType.${row.original.resourceType}`)}
          </Badge>
        ),
      }),
      columnHelper.accessor('action', {
        id: 'action',
        meta: {
          title: t('page.audit-logs.table.action'),
        },
        header: () => t('page.audit-logs.table.action'),
        cell: ({ row }) => (
          <Badge variant="outline">
            {t(`page.audit-logs.table.action.${row.original.action}`)}
          </Badge>
        ),
      }),
      columnHelper.display({
        id: 'changes',
        meta: {
          title: t('page.audit-logs.table.changes'),
        },
        header: () => t('page.audit-logs.table.changes'),
        cell: ({ row }) => (
          <div className="max-h-36 max-w-xl overflow-auto py-1">
            <AuditChangesList changes={row.original.changes} />
          </div>
        ),
      }),
      columnHelper.display({
        id: 'entity',
        size: 120,
        meta: {
          title: t('page.audit-logs.table.openEntity'),
        },
        header: () => t('page.audit-logs.table.openEntity'),
        cell: ({ row }) => {
          const path = getAuditLogEntityPath(row.original)
          if (!path)
            return null

          return (
            <Button size="sm" variant="outline" asChild>
              <Link to={path}>
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                {t('page.audit-logs.table.openEntity')}
              </Link>
            </Button>
          )
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
      actionColumn(),
    ]
  }, [language, isLoading, openModal, t])
  return columns
}
