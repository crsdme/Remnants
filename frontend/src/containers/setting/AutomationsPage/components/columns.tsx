import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  Copy,
  Pencil,
  Trash,
} from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { TableActionDropdown } from '@/components'
import { Badge, Button, Checkbox } from '@/components/ui'
import { useAutomationContext } from '@/contexts'
import { formatDate } from '@/utils/helpers'

const sortIcons = { asc: ArrowUp, desc: ArrowDown }

export function useColumns() {
  const { t, i18n } = useTranslation()
  const { isLoading, openModal, removeAutomation } = useAutomationContext()

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

    function selectColumn() {
      return ({
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
              permission: 'automation.copy',
              onClick: () => navigator.clipboard.writeText(item.id),
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
            },
          ]

          return <TableActionDropdown actions={actions} />
        },
      })
    }

    return [
      selectColumn(),
      {
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
        accessorFn: row => row.name,
      },
      {
        id: 'trigger',
        size: 150,
        meta: {
          title: t('page.automations.table.trigger'),
        },
        header: ({ column }) => sortHeader(column, t('page.automations.table.trigger')),
        cell: ({ row }) => <Badge>{t(`page.automations.trigger.${row.original.trigger.type}`)}</Badge>,
      },
      {
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
              {conditions.map(condition => (
                <Badge key={condition.id}>{t(`page.automations.condition.${condition.field}`)}</Badge>
              ))}
            </div>
          )
        },
      },
      {
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
              {actions.map(action => (
                <Badge key={action.id}>{t(`page.automations.action.${action.field}`)}</Badge>
              ))}
            </div>
          )
        },
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
