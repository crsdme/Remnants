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
import { useExpenseContext } from '@/contexts'
import { formatDate } from '@/utils/helpers'

const sortIcons = { asc: ArrowUp, desc: ArrowDown }

export function useColumns() {
  const { t, i18n } = useTranslation()
  const { isLoading, openModal, removeExpense } = useExpenseContext()

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
              permission: 'expense.copy',
              onClick: () => navigator.clipboard.writeText(item.id),
              label: t('table.copy'),
              icon: <Copy className="h-4 w-4" />,
            },
            {
              permission: 'expense.edit',
              onClick: () => openModal(item),
              label: t('table.edit'),
              icon: <Pencil className="h-4 w-4" />,
            },
            {
              permission: 'expense.delete',
              onClick: () => removeExpense({ ids: [item.id] }),
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
      {
        id: 'amount',
        accessorKey: 'amount',
        meta: {
          title: t('page.expenses.table.amount'),
          batchEdit: true,
          batchEditType: 'number',
          filterable: true,
          filterType: 'number',
          sortable: true,
        },
        header: () => t('page.expenses.table.amount'),
        cell: ({ row }) => {
          const amount = row.original.amount
          const currency = row.original.currency.symbols[i18n.language]
          return <Badge variant="outline">{`${amount} ${currency}`}</Badge>
        },
      },
      {
        id: 'cashregister',
        accessorKey: 'cashregister',
        meta: {
          title: t('page.expenses.table.cashregister'),
          batchEdit: true,
          batchEditType: 'number',
          filterable: true,
          filterType: 'number',
          sortable: true,
        },
        header: () => t('page.expenses.table.cashregister'),
        cell: ({ row }) => <Badge variant="outline">{`${row.original.cashregister.names[i18n.language]}`}</Badge>,
      },
      {
        id: 'cashregisterAccount',
        accessorKey: 'cashregisterAccount',
        meta: {
          title: t('page.expenses.table.cashregisterAccount'),
          batchEdit: true,
          batchEditType: 'number',
          filterable: true,
          filterType: 'number',
          sortable: true,
        },
        header: () => t('page.expenses.table.cashregisterAccount'),
        cell: ({ row }) => <Badge variant="outline">{`${row.original.cashregisterAccount.names[i18n.language]}`}</Badge>,
      },
      {
        id: 'categories',
        accessorKey: 'categories',
        meta: {
          title: t('page.expenses.table.categories'),
          batchEdit: true,
          batchEditType: 'number',
          filterable: true,
          filterType: 'number',
          sortable: true,
        },
        header: () => t('page.expenses.table.categories'),
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            {row.original.categories.map(category => <Badge variant="outline" key={category.id}>{`${category.names[i18n.language]}`}</Badge>)}
          </div>
        ),
      },
      {
        id: 'type',
        accessorKey: 'type',
        meta: {
          title: t('page.expenses.table.type'),
          batchEdit: true,
          batchEditType: 'number',
          filterable: true,
          filterType: 'number',
          sortable: true,
        },
        header: () => t('page.expenses.table.type'),
        cell: ({ row }) => <Badge variant="outline">{t(`page.expenses.table.type.${row.original.type}`)}</Badge>,
      },
      {
        id: 'comment',
        accessorKey: 'comment',
        meta: {
          title: t('page.expenses.table.comment'),
          batchEdit: true,
          batchEditType: 'number',
          filterable: true,
          filterType: 'number',
          sortable: true,
        },
        header: () => t('page.expenses.table.comment'),
        accessorFn: row => row.comment,
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
