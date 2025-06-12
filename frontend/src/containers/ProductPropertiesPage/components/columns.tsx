import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  Copy,
  CopyPlus,
  Pencil,
  SquarePlus,
  Trash,
} from 'lucide-react'
import { useMemo } from 'react'

import { useTranslation } from 'react-i18next'
import { TableActionDropdown } from '@/components/TableActionDropdown/TableActionDropdown'
import { Badge, Button, Checkbox } from '@/components/ui'
import { useProductPropertiesContext } from '@/contexts'
import formatDate from '@/utils/helpers/formatDate'

const sortIcons = { asc: ArrowUp, desc: ArrowDown }

export function useColumns() {
  const { t, i18n } = useTranslation()
  const productPropertiesContext = useProductPropertiesContext()

  const columns = useMemo(() => {
    function sortHeader(column, label) {
      const isLoading = productPropertiesContext.isLoading
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
          if (row.original.options?.length > 0) {
            return (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => row.toggleExpanded()}
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
              permission: 'product-properties.copy',
              onClick: () => navigator.clipboard.writeText(item.id),
              label: t('table.copy'),
              icon: <Copy className="h-4 w-4" />,
            },
            {
              permission: 'product-properties.edit',
              onClick: () => productPropertiesContext.openModal(item),
              label: t('table.edit'),
              icon: <Pencil className="h-4 w-4" />,
            },
            ...((item.type === 'select' || item.type === 'multiSelect' || item.type === 'color')
              ? [{
                  permission: 'product-properties-options.create',
                  onClick: () => productPropertiesContext.openOptionsModal({ option: undefined, property: item }),
                  label: t('table.addOption'),
                  icon: <SquarePlus className="h-4 w-4" />,
                }]
              : []),
            {
              permission: 'product-properties.delete',
              onClick: () => productPropertiesContext.removeProductProperty({ ids: [item.id] }),
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
        id: 'names',
        size: 150,
        meta: {
          title: t('page.product-properties.table.names'),
          batchEdit: true,
          batchEditType: 'textMultiLanguage',
          filterable: true,
          filterType: 'text',
          sortable: true,
        },
        header: ({ column }) => sortHeader(column, t('page.product-properties.table.names')),
        accessorFn: row => row.names?.[i18n.language] || row.names?.en,
      },
      {
        id: 'type',
        accessorKey: 'type',
        meta: {
          title: t('page.product-properties.table.type'),
          batchEdit: true,
          batchEditType: 'text',
          filterable: true,
          filterType: 'text',
          sortable: true,
        },
        header: ({ column }) => sortHeader(column, t('page.product-properties.table.type')),
        cell: ({ row }) => <Badge variant="outline">{t(`page.product-properties.type.${row.original.type}`)}</Badge>,
      },
      {
        id: 'priority',
        accessorKey: 'priority',
        meta: {
          title: t('page.product-properties.table.priority'),
          batchEdit: true,
          batchEditType: 'number',
          filterable: true,
          filterType: 'number',
          sortable: true,
        },
        header: ({ column }) => sortHeader(column, t('page.product-properties.table.priority')),
        cell: ({ row }) => <Badge variant="outline">{row.original.priority}</Badge>,
      },
      {
        id: 'isRequired',
        accessorKey: 'isRequired',
        meta: {
          title: t('page.product-properties.table.isRequired'),
          batchEdit: true,
          batchEditType: 'boolean',
          filterable: true,
          filterType: 'boolean',
          sortable: true,
        },
        header: t('page.product-properties.table.isRequired'),
        cell: ({ row }) => <Badge variant={row.original.isRequired ? 'success' : 'destructive'}>{t(`table.active.${row.original.isRequired}`)}</Badge>,
      },
      {
        id: 'showInTable',
        accessorKey: 'showInTable',
        meta: {
          title: t('page.product-properties.table.showInTable'),
          batchEdit: true,
          batchEditType: 'boolean',
          filterable: true,
          filterType: 'boolean',
          sortable: true,
        },
        header: t('page.product-properties.table.showInTable'),
        cell: ({ row }) => <Badge variant={row.original.showInTable ? 'success' : 'destructive'}>{t(`table.active.${row.original.showInTable}`)}</Badge>,
      },
      {
        id: 'active',
        accessorKey: 'active',
        meta: {
          title: t('page.product-properties.table.active'),
          batchEdit: true,
          batchEditType: 'boolean',
          filterable: true,
          filterType: 'boolean',
          sortable: true,
        },
        header: t('page.product-properties.table.active'),
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
