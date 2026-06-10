import type { AutomationDTO } from '@remnant/shared'
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
import { useAutomationContext } from '../context'

const sortIcons = { asc: ArrowUp, desc: ArrowDown }
const columnHelper = createColumnHelper<AutomationDTO>()

export function useColumns() {
  const { t, language } = useLocale()
  const { isLoading, openModal, removeAutomation } = useAutomationContext()

  const columns = useMemo(() => {
    function sortHeader(column: Column<AutomationDTO, unknown>, label: string) {
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
              permission: 'automation.copy',
              onClick: () => void navigator.clipboard.writeText(item.id),
              label: t('table.copy'),
              icon: <Copy className="h-4 w-4" />,
            },
            {
              permission: 'automation.edit',
              onClick: () => openModal(item),
              label: t('table.edit'),
              icon: <Pencil className="h-4 w-4" />,
            },
            {
              permission: 'automation.delete',
              onClick: () => removeAutomation({ ids: [item.id] }),
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
      columnHelper.accessor('name', {
        id: 'name',
        size: 150,
        meta: {
          title: t('page.automations.table.name'),
          batchEdit: true,
          batchEditType: 'textMultiLanguage',
          filterable: true,
          filterType: 'text',
          sortable: true,
          defaultVisible: true,
        },
        header: ({ column }) => sortHeader(column, t('page.automations.table.name')),
      }),
      columnHelper.display({
        id: 'trigger',
        size: 150,
        meta: {
          title: t('page.automations.table.trigger'),
        },
        header: ({ column }) => sortHeader(column, t('page.automations.table.trigger')),
        cell: ({ row }) => <Badge>{t(`page.automations.trigger.${row.original.trigger.type}`)}</Badge>,
      }),
      columnHelper.display({
        id: 'conditions',
        size: 150,
        meta: {
          title: t('page.automations.table.conditions'),
        },
        header: ({ column }) => sortHeader(column, t('page.automations.table.conditions')),
        cell: ({ row }) => {
          const conditions = row.original.conditions

          return (
            <div className="flex flex-col gap-2">
              {conditions.map((condition, index) => (
                <Badge key={`${condition.field}-${index}`}>{t(`page.automations.condition.${condition.field}`)}</Badge>
              ))}
            </div>
          )
        },
      }),
      columnHelper.display({
        id: 'actions',
        size: 150,
        meta: {
          title: t('page.automations.table.actions'),
        },
        header: ({ column }) => sortHeader(column, t('page.automations.table.actions')),
        cell: ({ row }) => {
          const actions = row.original.actions

          return (
            <div className="flex flex-col gap-2">
              {actions.map((action, index) => (
                <Badge key={`${action.field}-${index}`}>{t(`page.automations.action.${action.field}`)}</Badge>
              ))}
            </div>
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
  }, [language, isLoading, openModal, removeAutomation, t])
  return columns
}
