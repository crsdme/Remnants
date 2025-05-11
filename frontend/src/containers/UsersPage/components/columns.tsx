import type { Column, ColumnDef } from '@tanstack/react-table'

import { Badge, Button, Checkbox } from '@/components/ui'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { useUserContext } from '@/utils/contexts'
import formatDate from '@/utils/helpers/formatDate'
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  MoreHorizontal,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

const sortIcons = { asc: ArrowUp, desc: ArrowDown }

export function useColumns({ setSorters, expandedRows, setExpandedRows }): ColumnDef<User>[] {
  const { t, i18n } = useTranslation()
  const userContext = useUserContext()

  const sortHeader = (column: Column<User>, label: string) => {
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
        disabled={userContext.isLoading}
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
      id: 'active',
      accessorKey: 'active',
      meta: {
        title: t('page.units.table.active'),
        batchEdit: true,
        batchEditType: 'boolean',
        filterable: true,
        filterType: 'boolean',
        sortable: true,
      },
      header: t('page.units.table.active'),
      cell: ({ row }) => <Badge variant="outline">{row.original.active.toString()}</Badge>,
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      meta: {
        title: t('page.users.table.createdAt'),
        filterable: true,
        filterType: 'date',
        sortable: true,
      },
      header: ({ column }) => sortHeader(column, t('page.users.table.createdAt')),
      cell: ({ row }) => formatDate(row.getValue('createdAt'), 'MMMM dd, yyyy', i18n.language),
    },
    {
      id: 'updatedAt',
      accessorKey: 'updatedAt',
      meta: {
        title: t('page.users.table.updatedAt'),
        filterable: true,
        filterType: 'date',
        sortable: true,
      },
      header: ({ column }) => sortHeader(column, t('page.users.table.updatedAt')),
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
        const user = row.original

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
                <DropdownMenuLabel>{t('page.users.table.actions')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id)}>
                  {t('page.users.table.copy')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => userContext.toggleModal(user)}>
                  {t('page.users.table.edit')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => userContext.duplicateUsers({ ids: [user.id] })}
                >
                  {t('page.users.table.duplicate')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => userContext.removeUsers({ ids: [user.id] })}
                  variant="destructive"
                >
                  {t('page.users.table.delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]
}
