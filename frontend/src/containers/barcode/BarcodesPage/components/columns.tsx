import type { BarcodeDTO } from '@remnant/shared'
import type { Column } from '@tanstack/react-table'
import { createColumnHelper } from '@tanstack/react-table'
import {
  ArrowDown,
  ArrowUp,
  Barcode,
  ChevronsUpDown,
  Copy,
  Pencil,
  Trash,
} from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { TableActionDropdown } from '@/components'
import { Badge, Button, Checkbox } from '@/components/ui'
import { backendUrl } from '@/utils/constants'
import { formatDate } from '@/utils/helpers'
import { buildUrl } from '@/utils/helpers/url'
import { useLocale } from '@/utils/hooks/'
import { useBarcodeContext } from '../context'

const sortIcons = { asc: ArrowUp, desc: ArrowDown }
const columnHelper = createColumnHelper<BarcodeDTO>()

export function useColumns() {
  const { t, language } = useLocale()
  const navigate = useNavigate()
  const { isLoading, removeBarcodes } = useBarcodeContext()

  const columns = useMemo(() => {
    function sortHeader(column: Column<BarcodeDTO>, label: string) {
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
              permission: 'barcode.copy',
              onClick: async () => navigator.clipboard.writeText(item.id),
              label: t('table.copy'),
              icon: <Copy className="h-4 w-4" />,
            },
            {
              permission: 'barcode.edit',
              onClick: () => void navigate(`/barcodes/edit/${item.id}`),
              label: t('table.edit'),
              icon: <Pencil className="h-4 w-4" />,
            },
            {
              permission: 'barcode.print',
              link: buildUrl(backendUrl, 'api/barcodes/print', { codes: [item.code], size: '30x20', language }),
              type: 'link' as const,
              label: t('table.print', { size: '30x20' }),
              icon: <Barcode className="h-4 w-4" />,
            },
            {
              permission: 'barcode.print',
              link: buildUrl(backendUrl, 'api/barcodes/print', { codes: [item.code], size: '60x30', language }),
              type: 'link' as const,
              label: t('table.print', { size: '60x30' }),
              icon: <Barcode className="h-4 w-4" />,
            },
            {
              permission: 'barcode.print',
              link: buildUrl(backendUrl, 'api/barcodes/print', { codes: [item.code], size: '55x40', language }),
              type: 'link' as const,
              label: t('table.print', { size: '55x40' }),
              icon: <Barcode className="h-4 w-4" />,
            },
            {
              permission: 'barcode.delete',
              onClick: () => removeBarcodes({ ids: [item.id] }),
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
      columnHelper.accessor('code', {
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
      }),
      columnHelper.display({
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
            {(row.original.products).map(product => (
              <Badge key={product.id}>
                {product.names?.[language]}
              </Badge>
            ))}
          </div>
        ),
      }),
      columnHelper.accessor('active', {
        id: 'active',
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
        cell: ({ getValue }) => {
          const isActive = getValue()
          return <Badge variant={isActive ? 'success' : 'destructive'}>{t(`table.active.${isActive}`)}</Badge>
        },
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
  }, [language, isLoading, navigate, removeBarcodes, t])
  return columns
}
