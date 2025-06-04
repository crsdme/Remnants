import type { Column, ColumnDef } from '@tanstack/react-table'

import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  MoreHorizontal,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Badge, Button, Checkbox } from '@/components/ui'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useUserRoleContext } from '@/contexts'
import formatDate from '@/utils/helpers/formatDate'

const sortIcons = { asc: ArrowUp, desc: ArrowDown }

export function useColumns({ setSorters, expandedRows, setExpandedRows }): ColumnDef<UserRole>[] {
  const { t, i18n } = useTranslation()
  const userRoleContext = useUserRoleContext()

  const sortHeader = (column: Column<UserRole>, label: string) => {
    const sortOrder = column.getIsSorted() || undefined
    const Icon = (sortIcons[sortOrder] || ChevronsUpDown)

    const handleSort = () => {
      if (sortOrder === 'asc') {
        column.toggleSorting(true)
      }
      else if (sortOrder === 'desc') {
        column.clearSorting()
      }
      else if (!sortOrder) {
        column.toggleSorting(false)
      }

      setSorters({ [`${column.id}`]: sortOrder })
    }

    return (
      <Button
        disabled={userRoleContext.isLoading}
        variant="ghost"
        onClick={handleSort}
        className="my-2 flex items-center gap-2"
      >
        {label}
        <Icon className="w-4 h-4" />
      </Button>
    )
  }

  return [
    {
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
    },
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
    {
      id: 'action',
      size: 85,
      meta: {
        title: t('page.users.table.actions'),
      },
      enableHiding: false,
      cell: ({ row }) => {
        const userRole = row.original

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setExpandedRows(prev => ({
                  ...prev,
                  [row.id]: !prev[row.id],
                }))}
              className="h-8 w-8 p-0"
            >
              {expandedRows[row.id]
                ? (
                    <ChevronDown className="h-4 w-4" />
                  )
                : (
                    <ChevronRight className="h-4 w-4" />
                  )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t('table.actions')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(userRole.id)}>
                  {t('table.copy')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => userRoleContext.toggleModal(userRole)}>
                  {t('table.edit')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => userRoleContext.duplicateUserRoles({ ids: [userRole.id] })}
                >
                  {t('table.duplicate')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => userRoleContext.removeUserRoles({ ids: [userRole.id] })}
                  variant="destructive"
                >
                  {t('table.delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]
}
