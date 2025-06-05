import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
} from 'lucide-react'
import { useMemo } from 'react'

import { useTranslation } from 'react-i18next'
import { TableActionDropdown } from '@/components/TableActionDropdown/TableActionDropdown'
import { Badge, Button, Checkbox } from '@/components/ui'
import { useUserRoleContext } from '@/contexts'
import formatDate from '@/utils/helpers/formatDate'

const sortIcons = { asc: ArrowUp, desc: ArrowDown }

export function useColumns() {
  const { t, i18n } = useTranslation()
  const userRoleContext = useUserRoleContext()

  const columns = useMemo(() => {
    function sortHeader(column, label) {
      const isLoading = userRoleContext.isLoading
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
        cell: ({ row }) => (
          row.getCanExpand()
            ? (
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
            : null
        ),
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

          return (
            <TableActionDropdown
              copyAction={{
                permission: 'userRole.copy',
                onClick: () => navigator.clipboard.writeText(item.id),
              }}
              editAction={{
                permission: 'userRole.edit',
                onClick: () => userRoleContext.toggleModal(item),
              }}
              duplicateAction={{
                permission: 'userRole.duplicate',
                onClick: () => userRoleContext.duplicateUserRoles({ ids: [item.id] }),
              }}
              deleteAction={{
                permission: 'userRole.delete',
                onClick: () => userRoleContext.removeUserRoles({ ids: [item.id] }),
              }}
            />
          )
        },
      })
    }

    return [
      selectColumn(),
      expanderColumn(),
      {
        id: 'names',
        size: 150,
        meta: {
          title: t('page.userRoles.table.names'),
          filterable: true,
          filterType: 'text',
          sortable: true,
        },
        header: ({ column }) => sortHeader(column, t('page.userRoles.table.names')),
        accessorFn: row => row.names?.[i18n.language] || row.names?.en,
      },
      {
        id: 'permissions',
        size: 100,
        meta: {
          title: t('page.userRoles.table.permissions'),
          filterable: true,
          filterType: 'text',
          sortable: true,
        },
        header: () => t('page.userRoles.table.permissions'),
        accessorFn: row => row.permissions,
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.permissions.map(permission => (
              <Badge variant="outline" key={permission}>
                {t(`permission.${permission}`)}
              </Badge>
            ))}
          </div>
        ),
      },
      {
        id: 'active',
        accessorKey: 'active',
        meta: {
          title: t('page.userRoles.table.active'),
          batchEdit: true,
          batchEditType: 'boolean',
          filterable: true,
          filterType: 'boolean',
          sortable: true,
        },
        header: t('page.userRoles.table.active'),
        cell: ({ row }) => <Badge variant="outline">{row.original.active.toString()}</Badge>,
      },
      {
        id: 'priority',
        accessorKey: 'priority',
        meta: {
          title: t('page.userRoles.table.priority'),
          batchEdit: true,
          batchEditType: 'number',
          filterable: true,
          filterType: 'number',
          sortable: true,
        },
        header: t('page.userRoles.table.priority'),
        cell: ({ row }) => <Badge variant="outline">{row.original.priority}</Badge>,
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
