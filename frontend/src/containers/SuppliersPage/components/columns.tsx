import type { SupplierDTO } from '@remnant/shared'
import type { Column } from '@tanstack/react-table'
import { createColumnHelper } from '@tanstack/react-table'
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  Copy,
  Pencil,
  Trash,
} from 'lucide-react'
import { useMemo } from 'react'

import { TableActionDropdown } from '@/components'
import { Badge, Button, Checkbox } from '@/components/ui'
import { formatDate } from '@/utils/helpers'
import { useLocale } from '@/utils/hooks'

import { useSupplierContext } from '../context'

const sortIcons = { asc: ArrowUp, desc: ArrowDown }

const columnHelper = createColumnHelper<SupplierDTO>()

export function useColumns() {
  const { t, language } = useLocale()
  const { isLoading, openModal, removeSupplier } = useSupplierContext()

  const columns = useMemo(() => {
    function sortHeader(column: Column<SupplierDTO, unknown>, label: string) {
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
              permission: 'supplier.copy',
              onClick: async () => navigator.clipboard.writeText(item.id),
              label: t('table.copy'),
              icon: <Copy className="h-4 w-4" />,
            },
            {
              permission: 'supplier.edit',
              onClick: () => openModal(item),
              label: t('table.edit'),
              icon: <Pencil className="h-4 w-4" />,
            },
            {
              permission: 'supplier.delete',
              onClick: () => removeSupplier({ ids: [item.id] }),
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
      columnHelper.accessor('name', {
        id: 'name',
        size: 150,
        meta: {
          title: t('page.suppliers.table.name'),
          batchEdit: true,
          batchEditType: 'textMultiLanguage',
          filterable: true,
          filterType: 'text',
          sortable: true,
          defaultVisible: true,
        },
        header: ({ column }) => sortHeader(column, t('page.suppliers.table.name')),
      }),
      columnHelper.accessor('phones', {
        id: 'phones',
        meta: {
          title: t('page.suppliers.table.phones'),
          batchEdit: true,
          batchEditType: 'number',
          filterable: true,
          filterType: 'number',
          sortable: true,
        },
        header: ({ column }) => sortHeader(column, t('page.suppliers.table.phones')),
        cell: ({ row }) => {
          const phones = row.original.phones || []
          return (
            <div className="flex flex-wrap gap-2">
              {phones.map((phone, index) => (
                <Badge key={`${row.original.id}-phone-${index}-${phone}`} variant="outline">{phone}</Badge>
              ))}
            </div>
          )
        },
      }),
      columnHelper.accessor('emails', {
        id: 'emails',
        meta: {
          title: t('page.suppliers.table.emails'),
          batchEdit: true,
          batchEditType: 'textMultiLanguage',
          filterable: true,
          filterType: 'text',
          sortable: true,
        },
        header: ({ column }) => sortHeader(column, t('page.suppliers.table.emails')),
        cell: ({ row }) => {
          const emails = row.original.emails || []
          return (
            <div className="flex flex-wrap gap-2">
              {emails.map((email, index) => (
                <Badge key={`${row.original.id}-email-${index}-${email}`} variant="outline">{email}</Badge>
              ))}
            </div>
          )
        },
      }),
      columnHelper.accessor('socials', {
        id: 'socials',
        meta: {
          title: t('page.suppliers.table.socials'),
          batchEdit: true,
          batchEditType: 'textMultiLanguage',
          filterable: true,
          filterType: 'text',
          sortable: true,
        },
        header: ({ column }) => sortHeader(column, t('page.suppliers.table.socials')),
        cell: ({ row }) => {
          const socials = row.original.socials || []
          return (
            <div className="flex flex-wrap gap-2">
              {socials.map(social => (
                <Badge key={`${row.original.id}-${social.type}-${social.value}`} variant="outline">
                  {`${t(`socials.type.${social.type}`)}: ${social.value}`}
                </Badge>
              ))}
            </div>
          )
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
  }, [isLoading, language, openModal, removeSupplier, t])

  return columns
}
