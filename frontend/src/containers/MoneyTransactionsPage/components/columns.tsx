import type { MoneyTransactionDTO } from '@remnant/shared'
import type { Column } from '@tanstack/react-table'
import { accountHasCapability } from '@remnant/shared'
import { createColumnHelper } from '@tanstack/react-table'
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Ban,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  Copy,
  Pencil,
} from 'lucide-react'
import { useMemo } from 'react'

import { TableActionDropdown } from '@/components'
import { Badge, Button, Checkbox } from '@/components/ui'
import { useAuthContext } from '@/contexts/AuthContext'
import { formatDate } from '@/utils/helpers'
import { hasPermission } from '@/utils/helpers/permission'
import { useLocale } from '@/utils/hooks'
import { useMoneyTransactionContext } from '../context'

const sortIcons = { asc: ArrowUp, desc: ArrowDown }

const columnHelper = createColumnHelper<MoneyTransactionDTO>()

function getBalanceAfterVariant({
  cancelled,
  balanceBefore,
  balanceAfter,
}: {
  cancelled: boolean
  balanceBefore: number | null
  balanceAfter: number
}) {
  if (cancelled || balanceBefore == null || balanceAfter === balanceBefore)
    return 'secondary' as const

  return balanceAfter > balanceBefore ? 'success' as const : 'destructive' as const
}

export function useColumns() {
  const { t, language } = useLocale()
  const { isLoading, openModal, receiveMoneyTransfer, cancelMoneyTransfer } = useMoneyTransactionContext()
  const { access, permissions } = useAuthContext()
  const isAdmin = hasPermission(permissions, 'other.admin')

  const columns = useMemo(() => {
    function sortHeader(column: Column<MoneyTransactionDTO>, label: string) {
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
        cell: ({ row }) => (
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
        ),
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
          const canReceive = item.type === 'transfer'
            && item.role === 'to'
            && !item.confirmed
            && !item.cancelled
            && !!item.transferId
            && (isAdmin || accountHasCapability(access.cashregisters, item.account.id, 'receive'))
          const canCancelIncoming = item.type === 'transfer'
            && item.role === 'to'
            && item.awaitingReceive
            && !!item.transferId
            && (isAdmin || accountHasCapability(access.cashregisters, item.account.id, 'receive'))
          const canCancelOutgoing = item.type === 'transfer'
            && item.role === 'from'
            && item.awaitingReceive
            && !!item.transferId
            && (isAdmin || accountHasCapability(access.cashregisters, item.account.id, 'transfer'))
          const canCancel = canCancelIncoming || canCancelOutgoing

          const actions = [
            {
              permission: 'moneyTransaction.copy',
              onClick: async () => navigator.clipboard.writeText(item.id),
              label: t('table.copy'),
              icon: <Copy className="h-4 w-4" />,
            },
            ...(canReceive
              ? [{
                  permission: 'moneyTransaction.receive',
                  onClick: () => receiveMoneyTransfer(item.transferId!),
                  label: t('table.receive'),
                  icon: <Check className="h-4 w-4" />,
                  isConfirm: true,
                  confirmTitle: t('page.money-transactions.confirm.receive.title'),
                  confirmDescription: t('page.money-transactions.confirm.receive.description'),
                  confirmLabel: t('page.money-transactions.confirm.receive.action'),
                }]
              : []),
            ...(canCancel
              ? [{
                  permission: 'moneyTransaction.cancel',
                  onClick: () => cancelMoneyTransfer(item.transferId!),
                  label: t('table.cancelTransfer'),
                  icon: <Ban className="h-4 w-4" />,
                  isDestructive: true,
                  isConfirm: true,
                  confirmTitle: t('page.money-transactions.confirm.cancel.title'),
                  confirmDescription: t('page.money-transactions.confirm.cancel.description'),
                  confirmLabel: t('page.money-transactions.confirm.cancel.action'),
                }]
              : []),
            {
              permission: 'moneyTransaction.edit',
              onClick: () => openModal(item as any),
              label: t('table.edit'),
              icon: <Pencil className="h-4 w-4" />,
            },
          ]

          return <TableActionDropdown actions={actions} />
        },
      })
    }

    return [
      selectColumn(),
      expanderColumn(),
      columnHelper.accessor('type', {
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
      }),
      columnHelper.accessor(row => row.account.names?.[language], {
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
      }),
      columnHelper.accessor(row => row.cashregister.names?.[language], {
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
      }),
      columnHelper.accessor('amount', {
        id: 'amount',
        meta: {
          title: t('page.money-transactions.table.amount'),
          filterable: true,
          filterType: 'number',
          sortable: true,
          defaultVisible: true,
        },
        header: ({ column }) => sortHeader(column, t('page.money-transactions.table.amount')),
        cell: ({ row }) => (
          <Badge variant={row.original.direction === 'in' ? 'success' : 'destructive'}>
            {`${row.original.direction === 'in' ? '+' : '-'} ${row.original.amount} ${row.original.currency.symbols?.[language]}`}
          </Badge>
        ),
      }),
      columnHelper.accessor('balanceAfter', {
        id: 'balanceAfter',
        size: 220,
        meta: {
          title: t('page.money-transactions.table.balance'),
          sortable: true,
          defaultVisible: true,
        },
        header: t('page.money-transactions.table.balance'),
        cell: ({ row }) => {
          const { balanceBefore, balanceAfter, currency, cancelled } = row.original
          if (balanceAfter == null)
            return <span className="text-muted-foreground">{t('page.money-transactions.table.empty')}</span>

          const symbol = currency.symbols?.[language] ?? ''
          const formatAmount = (value: number) => `${value} ${symbol}`.trim()
          const afterVariant = getBalanceAfterVariant({ cancelled, balanceBefore, balanceAfter })

          if (balanceBefore == null) {
            return (
              <Badge variant={afterVariant} className="tabular-nums">
                {formatAmount(balanceAfter)}
              </Badge>
            )
          }

          return (
            <div className="inline-flex items-center gap-1.5">
              <Badge variant="outline" className="tabular-nums font-normal text-muted-foreground">
                {formatAmount(balanceBefore)}
              </Badge>
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <Badge variant={afterVariant} className="tabular-nums">
                {formatAmount(balanceAfter)}
              </Badge>
            </div>
          )
        },
      }),
      columnHelper.accessor('confirmed', {
        id: 'confirmed',
        meta: {
          title: t('page.money-transactions.table.confirmed'),
          filterable: true,
          filterType: 'boolean',
          sortable: true,
          defaultVisible: true,
        },
        header: t('page.money-transactions.table.confirmed'),
        cell: ({ row }) => {
          if (row.original.cancelled) {
            return (
              <Badge variant="destructive">
                {t('page.money-transactions.table.confirmed.cancelled')}
              </Badge>
            )
          }

          return (
            <Badge variant={row.original.confirmed ? 'success' : 'warning'}>
              {t(`page.money-transactions.table.confirmed.${row.original.confirmed ? 'yes' : 'awaiting'}`)}
            </Badge>
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
          defaultVisible: true,
        },
        header: ({ column }) => sortHeader(column, t('table.createdAt')),
        cell: ({ row }) => formatDate(row.getValue('createdAt'), 'dd.MM.yyyy HH:mm:ss', language),
      }),
      actionColumn(),
    ]
  }, [access.cashregisters, cancelMoneyTransfer, isAdmin, isLoading, language, openModal, receiveMoneyTransfer, t])
  return columns
}
