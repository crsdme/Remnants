import type { Column, ColumnDef } from '@tanstack/react-table'

import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  MoreHorizontal,
} from 'lucide-react'
import { useState } from 'react'

import { useTranslation } from 'react-i18next'
import { useRequestCategories } from '@/api/hooks'
import { Badge, Button, Checkbox } from '@/components/ui'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useCategoryContext } from '@/utils/contexts'
import formatDate from '@/utils/helpers/formatDate'

const sortIcons = { asc: ArrowUp, desc: ArrowDown }

export function useColumns({ setSorters }): ColumnDef<Category>[] {
  const { t, i18n } = useTranslation()
  const categoryContext = useCategoryContext()
  const [search, setSearch] = useState('')

  const sortHeader = (column: Column<any>, label: string) => {
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
        disabled={categoryContext.isLoading}
        variant="ghost"
        onClick={handleSort}
        className="my-2 flex items-center gap-2"
      >
        {label}
        <Icon className="w-4 h-4" />
      </Button>
    )
  }

  const requestCategories = useRequestCategories(
    { pagination: { full: true }, filters: { names: search, active: [true], language: i18n.language } },
  )
  const categories = requestCategories.data?.data?.categories || []

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
    },
    {
      id: 'names',
      size: 150,
      meta: {
        title: t('page.categories.table.names'),
        batchEdit: true,
        batchEditType: 'textMultiLanguage',
        filterable: true,
        filterType: 'text',
        sortable: true,
      },
      header: ({ column }) => sortHeader(column, t('page.categories.table.names')),
      accessorFn: row => row.names?.[i18n.language] || row.names?.en,
    },
    {
      id: 'priority',
      accessorKey: 'priority',
      meta: {
        title: t('page.categories.table.priority'),
        batchEdit: true,
        batchEditType: 'number',
        filterable: true,
        filterType: 'number',
        sortable: true,
      },
      header: ({ column }) => sortHeader(column, t('page.categories.table.priority')),
      cell: ({ row }) => <Badge variant="outline">{row.original.priority}</Badge>,
    },
    {
      id: 'active',
      accessorKey: 'active',
      meta: {
        title: t('page.categories.table.active'),
        batchEdit: true,
        batchEditType: 'boolean',
        filterable: true,
        filterType: 'boolean',
        sortable: true,
      },
      header: t('page.categories.table.active'),
      cell: ({ row }) => <Badge variant="outline">{row.original.active.toString()}</Badge>,
    },
    {
      id: 'parent',
      accessorKey: 'parent',
      meta: {
        title: t('page.categories.table.parent'),
        batchEdit: true,
        batchEditType: 'asyncValue',
        alwaysHidden: true,
        loadOptions: async (inputValue) => {
          setSearch(inputValue)
          return categories.map(category => ({ value: category.id, label: category.names[i18n.language] }))
        },
      },
      header: t('page.categories.table.parent'),
      enableSorting: false,
      enableHiding: false,
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
        title: t('table.actions'),
      },
      enableHiding: false,
      cell: ({ row }) => {
        const category = row.original

        return (
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t('table.actions')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(category.id)}>
                  {t('table.copy')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => categoryContext.toggleModal(category)}>
                  {t('table.edit')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => categoryContext.duplicateCategories({ ids: [category.id] })}
                >
                  {t('table.duplicate')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => categoryContext.removeCategory({ ids: [category.id] })}
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
