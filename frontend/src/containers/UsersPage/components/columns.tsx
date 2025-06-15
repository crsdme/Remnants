import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  Copy,
  CopyPlus,
  Pencil,
  Trash,
} from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { TableActionDropdown } from '@/components'
import { Badge, Button, Checkbox } from '@/components/ui'
import { useUserContext } from '@/contexts'
import { formatDate } from '@/utils/helpers'

const sortIcons = { asc: ArrowUp, desc: ArrowDown }

export function useColumns() {
  const { t, i18n } = useTranslation()
  const userContext = useUserContext()

  const columns = useMemo(() => {
    function sortHeader(column, label) {
      const isLoading = userContext.isLoading
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

    function expanderColumn() {
      return ({
        id: 'expander',
        header: '',
        cell: ({ row }) => {
          if (row.getCanExpand()) {
            return (
              <Button
                variant="ghost"
                size="icon"
                onClick={row.getToggleExpandedHandler()}
                style={{ width: 24, height: 24, padding: 0 }}
              >
                {row.getIsExpanded()
                  ? <ChevronDown size={16} />
                  : <ChevronRight size={16} />}
              </Button>
            )
          }
          return null
        },
        size: 24,
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
              permission: 'user.copy',
              onClick: () => navigator.clipboard.writeText(item.id),
              label: t('table.copy'),
              icon: <Copy className="h-4 w-4" />,
            },
            {
              permission: 'user.edit',
              onClick: () => userContext.toggleModal(item),
              label: t('table.edit'),
              icon: <Pencil className="h-4 w-4" />,
            },
            {
              permission: 'user.duplicate',
              onClick: () => userContext.duplicateUsers({ ids: [item.id] }),
              label: t('table.duplicate'),
              icon: <CopyPlus className="h-4 w-4" />,
            },
            {
              permission: 'user.delete',
              onClick: () => userContext.removeUsers({ ids: [item.id] }),
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
      expanderColumn(),
      {
        id: 'seq',
        size: 50,
        meta: {
          title: t('table.seq'),
        },
        header: t('table.seq'),
        accessorFn: row => row.seq,
      },
      {
        id: 'name',
        size: 150,
        meta: {
          title: t('page.users.table.name'),
          filterable: true,
          filterType: 'text',
          sortable: true,
        },
        header: ({ column }) => sortHeader(column, t('page.users.table.name')),
        accessorFn: row => row.name,
      },
      {
        id: 'login',
        size: 100,
        meta: {
          title: t('page.users.table.login'),
          filterable: true,
          filterType: 'text',
          sortable: true,
        },
        header: () => t('page.users.table.login'),
        accessorFn: row => row.login,
        cell: ({ row }) => (
          <Badge variant="outline">
            {row.original.login}
          </Badge>
        ),
      },
      {
        id: 'role',
        size: 100,
        meta: {
          title: t('page.users.table.role'),
          filterable: true,
          filterType: 'text',
          sortable: true,
        },
        header: () => t('page.users.table.role'),
        accessorFn: row => row.role,
        cell: ({ row }) => (
          <Badge variant="outline">
            {row.original.role.names[i18n.language]}
          </Badge>
        ),
      },
      {
        id: 'active',
        accessorKey: 'active',
        meta: {
          title: t('page.users.table.active'),
          batchEdit: true,
          batchEditType: 'boolean',
          filterable: true,
          filterType: 'boolean',
          sortable: true,
        },
        header: t('page.users.table.active'),
        cell: ({ row }) => <Badge variant={row.original.active ? 'success' : 'destructive'}>{t(`table.active.${row.original.active}`)}</Badge>,
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
