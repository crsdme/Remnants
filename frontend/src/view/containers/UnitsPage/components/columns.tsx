import type { ColumnDef } from '@tanstack/react-table'

import { useUnitContext } from '@/utils/contexts'
import formatDate from '@/utils/helpers/formatDate'

import { Badge, Button, Checkbox } from '@/view/components/ui'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/view/components/ui/dropdown-menu'
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  MoreHorizontal,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function useColumns({ setSorters, expandedRows, setExpandedRows }): ColumnDef<Currency>[] {
  const { t, i18n } = useTranslation()
  const unitContext = useUnitContext()

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
        title: t('page.units.table.names'),
        batchEdit: true,
        batchEditType: 'textMultiLanguage',
        filterable: true,
        filterType: 'text',
      },
      header: ({ column }) => {
        const sortOrder = column.getIsSorted() || 'none'
        const icons = { asc: ArrowUp, desc: ArrowDown, none: ChevronsUpDown }
        const Icon = icons[sortOrder]

        const handleSort = () => {
          let nextSortOrder
          if (sortOrder === 'asc') {
            column.toggleSorting(true)
            nextSortOrder = 'desc'
          }
          else if (sortOrder === 'desc') {
            column.clearSorting()
            nextSortOrder = 'none'
          }
          else if (sortOrder === 'none') {
            column.toggleSorting(false)
            nextSortOrder = 'asc'
          }
          const sortFormat = {
            asc: 1,
            desc: -1,
            none: undefined,
          }

          setSorters({ names: sortFormat[nextSortOrder] })
        }

        return (
          <Button
            disabled={unitContext.isLoading}
            variant="ghost"
            onClick={handleSort}
            className="my-2 flex items-center gap-2"
          >
            {t('page.units.table.names')}
            {' '}
            <Icon className="w-4 h-4" />
          </Button>
        )
      },
      accessorFn: row => row.names?.[i18n.language] || row.names?.en,
    },
    {
      id: 'symbols',
      size: 100,
      meta: {
        title: t('page.units.table.symbols'),
        batchEdit: true,
        batchEditType: 'textMultiLanguage',
        filterable: true,
        filterType: 'text',
      },
      header: () => t('page.units.table.symbols'),
      accessorFn: row => row.symbols?.[i18n.language] || row.symbols?.en,
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.symbols?.[i18n.language] || row.original.symbols?.en}
        </Badge>
      ),
    },
    {
      id: 'priority',
      accessorKey: 'priority',
      meta: {
        title: t('page.units.table.priority'),
        batchEdit: true,
        batchEditType: 'number',
        filterable: true,
        filterType: 'number',
      },
      header: ({ column }) => {
        const sortOrder = column.getIsSorted() || 'none'
        const icons = { asc: ArrowUp, desc: ArrowDown, none: ChevronsUpDown }
        const Icon = icons[sortOrder]

        const handleSort = () => {
          let nextSortOrder
          if (sortOrder === 'asc') {
            column.toggleSorting(true)
            nextSortOrder = 'desc'
          }
          else if (sortOrder === 'desc') {
            column.clearSorting()
            nextSortOrder = 'none'
          }
          else if (sortOrder === 'none') {
            column.toggleSorting(false)
            nextSortOrder = 'asc'
          }
          const sortFormat = {
            asc: 1,
            desc: -1,
            none: undefined,
          }

          setSorters({ priority: sortFormat[nextSortOrder] })
        }

        return (
          <Button
            disabled={unitContext.isLoading}
            variant="ghost"
            onClick={handleSort}
            className="my-2 flex items-center gap-2"
          >
            {t('page.units.table.priority')}
            {' '}
            <Icon className="w-4 h-4" />
          </Button>
        )
      },
      cell: ({ row }) => <Badge variant="outline">{row.original.priority}</Badge>,
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
      },
      header: t('page.units.table.active'),
      cell: ({ row }) => <Badge variant="outline">{row.original.active.toString()}</Badge>,
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      meta: {
        title: t('page.units.table.createdAt'),
        filterable: true,
        filterType: 'date',
      },
      header: ({ column }) => {
        const sortOrder = column.getIsSorted() || 'none'
        const icons = { asc: ArrowUp, desc: ArrowDown, none: ChevronsUpDown }
        const Icon = icons[sortOrder]

        const handleSort = () => {
          let nextSortOrder
          if (sortOrder === 'asc') {
            column.toggleSorting(true)
            nextSortOrder = 'desc'
          }
          else if (sortOrder === 'desc') {
            column.clearSorting()
            nextSortOrder = 'none'
          }
          else if (sortOrder === 'none') {
            column.toggleSorting(false)
            nextSortOrder = 'asc'
          }
          const sortFormat = {
            asc: 1,
            desc: -1,
            none: undefined,
          }

          setSorters({ createdAt: sortFormat[nextSortOrder] })
        }

        return (
          <Button
            disabled={unitContext.isLoading}
            variant="ghost"
            onClick={handleSort}
            className="my-2 flex items-center gap-2"
          >
            {t('page.units.table.createdAt')}
            {' '}
            <Icon className="w-4 h-4" />
          </Button>
        )
      },
      cell: ({ row }) => formatDate(row.getValue('createdAt'), 'MMMM dd, yyyy', i18n.language),
    },
    {
      id: 'updatedAt',
      accessorKey: 'updatedAt',
      meta: {
        title: t('page.units.table.updatedAt'),
        filterable: true,
        filterType: 'date',
      },
      header: ({ column }) => {
        const sortOrder = column.getIsSorted() || 'none'
        const icons = { asc: ArrowUp, desc: ArrowDown, none: ChevronsUpDown }
        const Icon = icons[sortOrder]

        const handleSort = () => {
          let nextSortOrder
          if (sortOrder === 'asc') {
            column.toggleSorting(true)
            nextSortOrder = 'desc'
          }
          else if (sortOrder === 'desc') {
            column.clearSorting()
            nextSortOrder = 'none'
          }
          else if (sortOrder === 'none') {
            column.toggleSorting(false)
            nextSortOrder = 'asc'
          }
          const sortFormat = {
            asc: 1,
            desc: -1,
            none: undefined,
          }

          setSorters({ updatedAt: sortFormat[nextSortOrder] })
        }

        return (
          <Button
            disabled={unitContext.isLoading}
            variant="ghost"
            onClick={handleSort}
            className="my-2 flex items-center gap-2"
          >
            {t('page.units.table.updatedAt')}
            {' '}
            <Icon className="w-4 h-4" />
          </Button>
        )
      },
      cell: ({ row }) => formatDate(row.getValue('updatedAt'), 'MMMM dd, yyyy', i18n.language),
    },
    {
      id: 'action',
      size: 85,
      meta: {
        title: t('page.units.table.actions'),
      },
      enableHiding: false,
      cell: ({ row }) => {
        const unit = row.original

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
                <DropdownMenuLabel>{t('page.units.table.actions')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(unit._id)}>
                  {t('page.units.table.copy')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => unitContext.toggleModal(unit)}>
                  {t('page.units.table.edit')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => unitContext.duplicateUnits({ _ids: [unit._id] })}
                >
                  {t('page.units.table.duplicate')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => unitContext.removeUnit({ _ids: [unit._id] })}
                  variant="destructive"
                >
                  {t('page.units.table.delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]
}
