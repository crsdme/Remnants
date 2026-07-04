import type { ExpensePopulatedDTO } from '@remnant/shared'
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
import { useExpenseContext } from '../context'

const sortIcons = { asc: ArrowUp, desc: ArrowDown }
const columnHelper = createColumnHelper<ExpensePopulatedDTO>()

export function useColumns() {
  const { t, language } = useLocale()
  const { isLoading, openModal, removeExpense } = useExpenseContext()

  const columns = useMemo(() => {
    function sortHeader(column: Column<ExpensePopulatedDTO>, label: string) {
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
              permission: 'expense.copy',
              onClick: async () => navigator.clipboard.writeText(item.id),
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
              isConfirm: true,
            },
          ]

          return <TableActionDropdown actions={actions} />
        },
      })
    }

    return [
      selectColumn(),
      columnHelper.accessor('seq', {
        id: 'seq',
        size: 150,
        meta: {
          title: t('table.seq'),
          batchEdit: true,
          batchEditType: 'number',
          filterable: true,
          filterType: 'number',
          sortable: true,
          defaultVisible: true,
        },
        header: ({ column }) => sortHeader(column, t('table.seq')),
      }),
      columnHelper.accessor('amount', {
        id: 'amount',
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
          const currency = row.original.currency.symbols[language]
          return <Badge variant="destructive">{`-${amount} ${currency}`}</Badge>
        },
      }),
      columnHelper.accessor('cashregister', {
        id: 'cashregister',
        meta: {
          title: t('page.expenses.table.cashregister'),
          batchEdit: true,
          batchEditType: 'number',
          filterable: true,
          filterType: 'number',
          sortable: true,
        },
        header: () => t('page.expenses.table.cashregister'),
        cell: ({ row }) => <Badge variant="outline">{`${row.original.cashregister.names[language]}`}</Badge>,
      }),
      columnHelper.accessor('cashregisterAccount', {
        id: 'cashregisterAccount',
        meta: {
          title: t('page.expenses.table.cashregisterAccount'),
          batchEdit: true,
          batchEditType: 'number',
          filterable: true,
          filterType: 'number',
          sortable: true,
        },
        header: () => t('page.expenses.table.cashregisterAccount'),
        cell: ({ row }) => <Badge variant="outline">{`${row.original.cashregisterAccount.names[language]}`}</Badge>,
      }),
      columnHelper.accessor('categories', {
        id: 'categories',
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
            {row.original.categories.map(category => <Badge variant="outline" key={category.id}>{`${category.names[language]}`}</Badge>)}
          </div>
        ),
      }),
      columnHelper.accessor('type', {
        id: 'type',
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
      }),
      columnHelper.accessor('comment', {
        id: 'comment',
        meta: {
          title: t('page.expenses.table.comment'),
          batchEdit: true,
          batchEditType: 'number',
          filterable: true,
          filterType: 'number',
          sortable: true,
        },
        header: () => t('page.expenses.table.comment'),
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
  }, [language, isLoading, openModal, removeExpense, t])
  return columns
}
