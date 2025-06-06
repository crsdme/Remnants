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
import { useCategoryContext } from '@/contexts'
import formatDate from '@/utils/helpers/formatDate'

const sortIcons = { asc: ArrowUp, desc: ArrowDown }

export function useColumns(loadOptions) {
  const { t, i18n } = useTranslation()
  const categoryContext = useCategoryContext()

  const columns = useMemo(() => {
    function sortHeader(column, label) {
      const isLoading = categoryContext.isLoading
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
                permission: 'category.copy',
                onClick: () => navigator.clipboard.writeText(item.id),
              }}
              editAction={{
                permission: 'category.edit',
                onClick: () => categoryContext.toggleModal(item),
              }}
              duplicateAction={{
                permission: 'category.duplicate',
                onClick: () => categoryContext.duplicateCategories({ ids: [item.id] }),
              }}
              deleteAction={{
                permission: 'category.delete',
                onClick: () => categoryContext.removeCategory({ ids: [item.id] }),
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
          filterable: true,
          filterType: 'asyncValue',
          alwaysHidden: true,
          loadOptions,
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
      actionColumn(),
    ]
  }, [i18n.language])
  return columns
}
