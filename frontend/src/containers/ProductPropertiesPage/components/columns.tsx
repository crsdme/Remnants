import type { ProductPropertyDTO } from '@remnant/shared'
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
  SquarePlus,
  Trash,
} from 'lucide-react'
import { useMemo } from 'react'

import { TableActionDropdown } from '@/components'
import { Badge, Button } from '@/components/ui'
import { formatDate } from '@/utils/helpers'
import { useLocale } from '@/utils/hooks'
import { useProductPropertiesContext } from '../context'

const sortIcons = { asc: ArrowUp, desc: ArrowDown }
const columnHelper = createColumnHelper<ProductPropertyDTO>()

export function useColumns() {
  const { t, language } = useLocale()
  const { isLoading, openPropertyModal, openOptionsModal, removeProperty } = useProductPropertiesContext()

  const columns = useMemo(() => {
    function sortHeader(column: Column<ProductPropertyDTO>, label: string) {
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

    function expanderColumn() {
      return columnHelper.display({
        id: 'expander',
        header: '',
        cell: ({ row }) => {
          if ((row.original.optionIds?.length ?? 0) > 0) {
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
              permission: 'product-properties.copy',
              onClick: async () => navigator.clipboard.writeText(item.id),
              label: t('table.copy'),
              icon: <Copy className="h-4 w-4" />,
            },
            {
              permission: 'product-properties.edit',
              onClick: () => openPropertyModal(item),
              label: t('table.edit'),
              icon: <Pencil className="h-4 w-4" />,
            },
            ...((item.type === 'select' || item.type === 'multiSelect' || item.type === 'color')
              ? [
                  {
                    permission: 'product-properties-options.create',
                    onClick: () => openOptionsModal(undefined, item),
                    label: t('table.addOption'),
                    icon: <SquarePlus className="h-4 w-4" />,
                  },
                ]
              : []),
            {
              permission: 'product-properties.delete',
              onClick: () => removeProperty({ ids: [item.id] }),
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
      expanderColumn(),
      columnHelper.accessor(row => row.names?.[language], {
        id: 'names',
        size: 150,
        meta: {
          title: t('page.product-properties.table.names'),
          batchEdit: true,
          batchEditType: 'textMultiLanguage',
          filterable: true,
          filterType: 'text',
          sortable: true,
          defaultVisible: true,
        },
        header: ({ column }) => sortHeader(column, t('page.product-properties.table.names')),
        cell: ({ row }) => row.original.names?.[language],
      }),
      columnHelper.accessor(row => row.symbols?.[language], {
        id: 'symbols',
        size: 150,
        meta: {
          title: t('page.product-properties.table.symbols'),
          batchEdit: true,
          batchEditType: 'textMultiLanguage',
          filterable: true,
          filterType: 'text',
          sortable: true,
          defaultVisible: true,
        },
        header: ({ column }) => sortHeader(column, t('page.product-properties.table.symbols')),
        cell: ({ row }) => row.original.symbols?.[language],
      }),
      columnHelper.accessor('type', {
        id: 'type',
        meta: {
          title: t('page.product-properties.table.type'),
          batchEdit: true,
          batchEditType: 'text',
          filterable: true,
          filterType: 'text',
          sortable: true,
          defaultVisible: true,
        },
        header: ({ column }) => sortHeader(column, t('page.product-properties.table.type')),
        cell: ({ row }) => <Badge variant="outline">{t(`page.product-properties.type.${row.original.type}`)}</Badge>,
      }),
      columnHelper.accessor('priority', {
        id: 'priority',
        meta: {
          title: t('page.product-properties.table.priority'),
          batchEdit: true,
          batchEditType: 'number',
          filterable: true,
          filterType: 'number',
          sortable: true,
          defaultVisible: true,
        },
        header: ({ column }) => sortHeader(column, t('page.product-properties.table.priority')),
        cell: ({ row }) => <Badge variant="outline">{row.original.priority}</Badge>,
      }),
      columnHelper.accessor('isRequired', {
        id: 'isRequired',
        meta: {
          title: t('page.product-properties.table.isRequired'),
          batchEdit: true,
          batchEditType: 'boolean',
          filterable: true,
          filterType: 'boolean',
          sortable: true,
          defaultVisible: true,
        },
        header: t('page.product-properties.table.isRequired'),
        cell: ({ row }) => <Badge variant={row.original.isRequired ? 'success' : 'destructive'}>{t(`table.active.${row.original.isRequired}`)}</Badge>,
      }),
      columnHelper.accessor('showInTable', {
        id: 'showInTable',
        meta: {
          title: t('page.product-properties.table.showInTable'),
          batchEdit: true,
          batchEditType: 'boolean',
          filterable: true,
          filterType: 'boolean',
          sortable: true,
          defaultVisible: true,
        },
        header: t('page.product-properties.table.showInTable'),
        cell: ({ row }) => <Badge variant={row.original.showInTable ? 'success' : 'destructive'}>{t(`table.active.${row.original.showInTable}`)}</Badge>,
      }),
      columnHelper.accessor('showInStatistics', {
        id: 'showInStatistics',
        meta: {
          title: t('page.product-properties.table.showInStatistics'),
          batchEdit: true,
          batchEditType: 'boolean',
          filterable: true,
          filterType: 'boolean',
          sortable: true,
          defaultVisible: true,
        },
        header: t('page.product-properties.table.showInStatistics'),
        cell: ({ row }) => <Badge variant={row.original.showInStatistics ? 'success' : 'destructive'}>{t(`table.active.${row.original.showInStatistics}`)}</Badge>,
      }),
      columnHelper.accessor('active', {
        id: 'active',
        meta: {
          title: t('page.product-properties.table.active'),
          batchEdit: true,
          batchEditType: 'boolean',
          filterable: true,
          filterType: 'boolean',
          sortable: true,
          defaultVisible: true,
        },
        header: t('page.product-properties.table.active'),
        cell: ({ row }) => <Badge variant={row.original.active ? 'success' : 'destructive'}>{t(`table.active.${row.original.active}`)}</Badge>,
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
        cell: ({ row }) => formatDate(row.getValue('createdAt'), 'dd.MM.yyyy HH:mm', language),
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
        cell: ({ row }) => formatDate(row.getValue('updatedAt'), 'dd.MM.yyyy HH:mm', language),
      }),
      actionColumn(),
    ]
  }, [language, isLoading, openPropertyModal, openOptionsModal, removeProperty, t])
  return columns
}
