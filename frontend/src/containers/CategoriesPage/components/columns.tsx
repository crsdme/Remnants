import type { CategoryDTO } from '@remnant/shared'
import type { Column } from '@tanstack/react-table'
import { createColumnHelper } from '@tanstack/react-table'
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  Copy,
  Pencil,
  Trash,
} from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { TableActionDropdown } from '@/components'
import { Badge, Button, Checkbox } from '@/components/ui'
import { formatDate } from '@/utils/helpers'
import { useCategoryContext } from '../context'

const sortIcons = { asc: ArrowUp, desc: ArrowDown }
const columnHelper = createColumnHelper<CategoryDTO>()

export function useColumns() {
  const { t, i18n } = useTranslation()
  const { isLoading, openModal, removeCategories } = useCategoryContext()

  const columns = useMemo(() => {
    const language = i18n.language as keyof CategoryDTO['names']

    function sortHeader(column: Column<CategoryDTO>, label: string) {
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

    function selectColumn() {
      return columnHelper.display({
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
      return columnHelper.display({
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
              permission: 'category.copy',
              onClick: async () => navigator.clipboard.writeText(item.id),
              label: t('table.copy'),
              icon: <Copy className="h-4 w-4" />,
            },
            {
              permission: 'category.edit',
              onClick: () => openModal(item),
              label: t('table.edit'),
              icon: <Pencil className="h-4 w-4" />,
            },
            {
              permission: 'category.delete',
              onClick: () => removeCategories({ ids: [item.id] }),
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
      selectColumn(),
      expanderColumn(),
      columnHelper.accessor('seq', {
        id: 'seq',
        meta: {
          title: t('page.categories.table.seq'),
        },
        header: '#',
        cell: ({ getValue }) => getValue().toString(),
      }),
      columnHelper.accessor('names', {
        id: 'names',
        size: 150,
        meta: {
          title: t('page.categories.table.names'),
          batchEdit: true,
          batchEditType: 'textMultiLanguage',
          filterable: true,
          filterType: 'text',
          sortable: true,
          defaultVisible: true,
        },
        header: ({ column }) => sortHeader(column, t('page.categories.table.names')),
        cell: ({ getValue }) => getValue()?.[language],
      }),
      columnHelper.accessor('priority', {
        id: 'priority',
        meta: {
          title: t('page.categories.table.priority'),
          batchEdit: true,
          batchEditType: 'number',
          filterable: true,
          filterType: 'number',
          sortable: true,
          defaultVisible: true,
        },
        header: ({ column }) => sortHeader(column, t('page.categories.table.priority')),
        cell: ({ getValue }) => <Badge variant="outline">{getValue()}</Badge>,
      }),
      columnHelper.accessor('active', {
        id: 'active',
        meta: {
          title: t('page.categories.table.active'),
          batchEdit: true,
          batchEditType: 'boolean',
          filterable: true,
          filterType: 'boolean',
          sortable: true,
          defaultVisible: true,
        },
        header: t('page.categories.table.active'),
        cell: ({ getValue }) => {
          const isActive = getValue()
          return <Badge variant={isActive ? 'success' : 'destructive'}>{t(`table.active.${isActive}`)}</Badge>
        },
      }),
      columnHelper.accessor('parentId', {
        id: 'parent',
        meta: {
          title: t('page.categories.table.parent'),
        },
        header: t('page.categories.table.parent'),
        enableSorting: false,
        enableHiding: false,
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
        cell: ({ getValue }) => formatDate(getValue(), 'dd.MM.yyyy HH:mm', i18n.language),
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
        cell: ({ getValue }) => formatDate(getValue(), 'dd.MM.yyyy HH:mm', i18n.language),
      }),
      actionColumn(),
    ]
  }, [i18n.language, isLoading, openModal, removeCategories, t])
  return columns
}
