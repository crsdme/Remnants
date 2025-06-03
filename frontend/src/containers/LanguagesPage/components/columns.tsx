import type { Column, ColumnDef } from '@tanstack/react-table'

import {
  ArrowDown,
  ArrowUp,
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
import { useLanguageContext } from '@/utils/contexts'
import formatDate from '@/utils/helpers/formatDate'

const sortIcons = { asc: ArrowUp, desc: ArrowDown }

export function useColumns({ setSorters }): ColumnDef<Language>[] {
  const { t, i18n } = useTranslation()
  const languageContext = useLanguageContext()

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
        disabled={languageContext.isLoading}
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
        title: t('page.languages.table.name'),
        batchEdit: true,
        batchEditType: 'text',
        filterable: true,
        filterType: 'text',
        sortable: true,
      },
      header: ({ column }) => sortHeader(column, t('page.languages.table.name')),
      accessorFn: row => row.name,
    },
    {
      id: 'code',
      accessorKey: 'code',
      meta: {
        title: t('page.languages.table.code'),
        batchEdit: true,
        batchEditType: 'text',
        filterable: true,
        filterType: 'text',
        sortable: true,
      },
      header: () => t('page.languages.table.code'),
      accessorFn: row => row.code,
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.code}
        </Badge>
      ),
    },
    {
      id: 'priority',
      accessorKey: 'priority',
      meta: {
        title: t('page.languages.table.priority'),
        batchEdit: true,
        batchEditType: 'number',
        filterable: true,
        filterType: 'number',
        sortable: true,
      },
      header: ({ column }) => sortHeader(column, t('page.languages.table.priority')),
      cell: ({ row }) => <Badge variant="outline">{row.original.priority}</Badge>,
    },
    {
      id: 'active',
      accessorKey: 'active',
      meta: {
        title: t('page.languages.table.active'),
        batchEdit: true,
        batchEditType: 'boolean',
        filterable: true,
        filterType: 'boolean',
        sortable: true,
      },
      header: t('page.languages.table.active'),
      cell: ({ row }) => <Badge variant="outline">{row.original.active.toString()}</Badge>,
    },
    {
      id: 'main',
      accessorKey: 'main',
      meta: {
        title: t('page.languages.table.main'),
        batchEdit: true,
        batchEditType: 'boolean',
        filterable: true,
        filterType: 'boolean',
        sortable: true,
      },
      header: t('page.languages.table.main'),
      cell: ({ row }) => <Badge variant="outline">{row.original.main.toString()}</Badge>,
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
        const language = row.original

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
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(language.id)}>
                  {t('table.copy')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => languageContext.toggleModal(language)}>
                  {t('table.edit')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => languageContext.duplicateLanguages({ ids: [language.id] })}
                >
                  {t('table.duplicate')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => languageContext.removeLanguage({ ids: [language.id] })}
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
