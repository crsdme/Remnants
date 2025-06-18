import {
  ArrowDown,
  ArrowUp,
  Barcode,
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
import { useBarcodeContext } from '@/contexts'
import { backendUrl } from '@/utils/constants'
import { formatDate } from '@/utils/helpers'

const sortIcons = { asc: ArrowUp, desc: ArrowDown }

export function useColumns() {
  const { t, i18n } = useTranslation()
  const { isLoading, openModal, removeBarcodes } = useBarcodeContext()

  const columns = useMemo(() => {
    function sortHeader(column, label) {
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
              permission: 'barcode.copy',
              onClick: () => navigator.clipboard.writeText(item.id),
              label: t('table.copy'),
              icon: <Copy className="h-4 w-4" />,
            },
            {
              permission: 'barcode.edit',
              onClick: () => openModal(item),
              label: t('table.edit'),
              icon: <Pencil className="h-4 w-4" />,
            },
            {
              permission: 'barcode.print',
              link: `${backendUrl}api/barcodes/print?id=${item.id}&size=30x20&language=${i18n.language}`,
              type: 'link' as const,
              label: t('table.print', { size: '30x20' }),
              icon: <Barcode className="h-4 w-4" />,
            },
            {
              permission: 'barcode.print',
              link: `${backendUrl}api/barcodes/print?id=${item.id}&size=60x30&language=${i18n.language}`,
              type: 'link' as const,
              label: t('table.print', { size: '60x30' }),
              icon: <Barcode className="h-4 w-4" />,
            },
            {
              permission: 'barcode.delete',
              onClick: () => removeBarcodes({ ids: [item.id] }),
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
        id: 'code',
        size: 150,
        meta: {
          title: t('page.barcodes.table.code'),
          batchEdit: true,
          batchEditType: 'textMultiLanguage',
          filterable: true,
          filterType: 'text',
          sortable: true,
          defaultVisible: true,
        },
        header: ({ column }) => sortHeader(column, t('page.barcodes.table.code')),
        accessorFn: row => row.code,
      },
      {
        id: 'products',
        size: 150,
        meta: {
          title: t('page.barcodes.table.products'),
          batchEdit: true,
          batchEditType: 'textMultiLanguage',
          filterable: true,
          filterType: 'text',
          sortable: true,
          defaultVisible: true,
        },
        cell: ({ row }) => (
          <div className="flex gap-2">
            {row.original.products.map(product => (
              <Badge key={product.id}>
                {`${product.names[i18n.language]} (${product.quantity})`}
              </Badge>
            ))}
          </div>
        ),
      },
      {
        id: 'active',
        accessorKey: 'active',
        meta: {
          title: t('page.barcodes.table.active'),
          batchEdit: true,
          batchEditType: 'boolean',
          filterable: true,
          filterType: 'boolean',
          sortable: true,
          defaultVisible: true,
        },
        header: t('page.barcodes.table.active'),
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
