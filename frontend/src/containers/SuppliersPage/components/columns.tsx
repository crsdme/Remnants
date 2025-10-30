import {
  ArrowDown,
  ArrowUp,
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
import { useSupplierContext } from '../context'

const sortIcons = { asc: ArrowUp, desc: ArrowDown }

export function useColumns() {
  const { t, i18n } = useTranslation()
  const { isLoading, openModal, removeSupplier } = useSupplierContext()

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
              permission: 'supplier.copy',
              onClick: () => navigator.clipboard.writeText(item.id),
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
      {
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
        accessorFn: row => `${row.name} ${row.middleName || ''} ${row.lastName || ''}`.trim(),
      },
      {
        id: 'phones',
        accessorKey: 'phones',
        meta: {
          title: t('page.suppliers.table.phones'),
          batchEdit: true,
          batchEditType: 'number',
          filterable: true,
          filterType: 'number',
          sortable: true,
        },
        header: t('page.suppliers.table.phones'),
        cell: ({ row }) => {
          const phones = row.original.phones || []
          return (
            <div className="flex flex-wrap gap-2">
              {phones.map(phone => <Badge key={`${row.original.id}-${phone}-${Math.random()}`} variant="outline">{phone}</Badge>)}
            </div>
          )
        },
      },
      {
        id: 'emails',
        accessorKey: 'emails',
        meta: {
          title: t('page.suppliers.table.emails'),
          batchEdit: true,
          batchEditType: 'textMultiLanguage',
          filterable: true,
          filterType: 'text',
          sortable: true,
        },
        header: t('page.suppliers.table.emails'),
        cell: ({ row }) => {
          const emails = row.original.emails || []
          return (
            <div className="flex flex-wrap gap-2">
              {emails.map(email => <Badge key={`${row.original.id}-${email}-${Math.random()}`} variant="outline">{email}</Badge>)}
            </div>
          )
        },
      },
      {
        id: 'socials',
        accessorKey: 'socials',
        meta: {
          title: t('page.suppliers.table.socials'),
          batchEdit: true,
          batchEditType: 'textMultiLanguage',
          filterable: true,
          filterType: 'text',
          sortable: true,
        },
        header: t('page.suppliers.table.socials'),
        cell: ({ row }) => {
          const socials = row.original.socials || []
          return (
            <div className="flex flex-wrap gap-2">
              {socials.map(social => (
                <Badge key={`${row.original.id}-${social.value}}`} variant="outline">
                  {`${t(`socials.type.${social.type}`)}: ${social.value}`}
                </Badge>
              ))}
            </div>
          )
        },
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
        cell: ({ row }) => formatDate(row.getValue('createdAt'), 'dd.MM.yyyy HH:mm', i18n.language),
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
        cell: ({ row }) => formatDate(row.getValue('updatedAt'), 'dd.MM.yyyy HH:mm', i18n.language),
      },
      actionColumn(),
    ]
  }, [i18n.language])
  return columns
}
