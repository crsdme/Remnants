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
import { useMoneyTransactionContext } from '@/contexts'
import { formatDate } from '@/utils/helpers'

const sortIcons = { asc: ArrowUp, desc: ArrowDown }

export function useColumns() {
  const { t, i18n } = useTranslation()
  const { isLoading, openModal, removeMoneyTransaction } = useMoneyTransactionContext()

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
              permission: 'money-transaction.copy',
              onClick: () => navigator.clipboard.writeText(item.id),
              label: t('table.copy'),
              icon: <Copy className="h-4 w-4" />,
            },
            {
              permission: 'money-transaction.edit',
              onClick: () => openModal(item),
              label: t('table.edit'),
              icon: <Pencil className="h-4 w-4" />,
            },
            {
              permission: 'money-transaction.delete',
              onClick: () => removeMoneyTransaction({ ids: [item.id] }),
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
        id: 'type',
        size: 150,
        meta: {
          title: t('page.money-transactions.table.type'),
          filterable: true,
          filterType: 'select',
          sortable: true,
          defaultVisible: true,
          options: [
            { label: t('page.money-transactions.table.type.transfer'), value: 'transfer' },
            { label: t('page.money-transactions.table.type.income'), value: 'income' },
            { label: t('page.money-transactions.table.type.expense'), value: 'expense' },
          ],
        },
        header: ({ column }) => sortHeader(column, t('page.money-transactions.table.type')),
        cell: ({ row }) => <Badge variant="outline">{t(`page.money-transactions.table.type.${row.original.type.toLowerCase()}`)}</Badge>,
      },
      {
        id: 'account',
        size: 100,
        meta: {
          title: t('page.money-transactions.table.account'),
          filterable: true,
          filterType: 'text',
          sortable: true,
          defaultVisible: true,
        },
        header: ({ column }) => sortHeader(column, t('page.money-transactions.table.account')),
        accessorFn: row => row.account.names?.[i18n.language],
      },
      {
        id: 'cashregister',
        size: 100,
        meta: {
          title: t('page.money-transactions.table.cashregister'),
          filterable: true,
          filterType: 'text',
          sortable: true,
          defaultVisible: true,
        },
        header: ({ column }) => sortHeader(column, t('page.money-transactions.table.cashregister')),
        accessorFn: row => row.cashregister.names?.[i18n.language],
      },
      {
        id: 'amount',
        accessorKey: 'amount',
        meta: {
          title: t('page.money-transactions.table.amount'),
          filterable: true,
          filterType: 'number',
          sortable: true,
          defaultVisible: true,
        },
        header: ({ column }) => sortHeader(column, t('page.money-transactions.table.amount')),
        cell: ({ row }) => <Badge variant={row.original.direction === 'in' ? 'success' : 'destructive'}>{`${row.original.direction === 'in' ? '+' : '-'} ${row.original.amount} ${row.original.currency.symbols?.[i18n.language]}`}</Badge>,
      },
      {
        id: 'description',
        size: 100,
        meta: {
          title: t('page.money-transactions.table.description'),
          filterable: true,
          filterType: 'text',
          sortable: true,
          defaultVisible: true,
        },
        header: ({ column }) => sortHeader(column, t('page.money-transactions.table.description')),
        accessorFn: row => row.description,
      },
      {
        id: 'sourceModel',
        accessorKey: 'sourceModel',
        meta: {
          title: t('page.money-transactions.table.sourceModel'),
          filterable: true,
          filterType: 'select',
          sortable: true,
          defaultVisible: true,
          options: [
            { label: t('page.money-transactions.table.sourceModel.manual'), value: 'manual' },
          ],
        },
        header: ({ column }) => sortHeader(column, t('page.money-transactions.table.sourceModel')),
        cell: ({ row }) => <Badge variant="outline">{t(`page.money-transactions.table.sourceModel.${row.original.sourceModel.toLowerCase()}`)}</Badge>,
      },
      {
        id: 'confirmed',
        accessorKey: 'confirmed',
        meta: {
          title: t('page.money-transactions.table.confirmed'),
          filterable: true,
          filterType: 'boolean',
          sortable: true,
        },
        header: t('page.money-transactions.table.confirmed'),
        cell: ({ row }) => <Badge variant={row.original.confirmed ? 'success' : 'destructive'}>{t(`table.yesno.${row.original.confirmed}`)}</Badge>,
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
