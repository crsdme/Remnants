import type { ProcurementDTO } from '@remnant/shared'

import type { Column } from '@tanstack/react-table'

import { createColumnHelper } from '@tanstack/react-table'
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronsUpDown,
  Copy,
  CreditCard,
  Trash,
} from 'lucide-react'

import { useMemo } from 'react'

import { useNavigate } from 'react-router-dom'
import { TableActionDropdown } from '@/components'
import { Badge, Button } from '@/components/ui'
import { formatDate } from '@/utils/helpers'
import { useLocale } from '@/utils/hooks'

import { useProcurementContext } from '../context'

/** Строка списка: API отдаёт закупку с заполненным поставщиком и статусом оплаты */
type ProcurementTableRow = Omit<ProcurementDTO, 'supplier'> & {
  supplier: { id: string, name: string }
  paymentStatus?: string
}

const sortIcons = { asc: ArrowUp, desc: ArrowDown }

const columnHelper = createColumnHelper<ProcurementTableRow>()

export function useColumns() {
  const { t, language } = useLocale()
  const { removeProcurement } = useProcurementContext()
  const navigate = useNavigate()

  const columns = useMemo(() => {
    function sortHeader(column: Column<ProcurementTableRow, unknown>, label: string) {
      const sorted = column.getIsSorted()
      const Icon = sorted ? sortIcons[sorted] : ChevronsUpDown

      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting()}
          className="my-2 flex items-center gap-2"
        >
          {label}
          <Icon className="w-4 h-4" />
        </Button>
      )
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
              permission: 'procurement.copy',
              onClick: async () => navigator.clipboard.writeText(item.id),
              label: t('table.copy'),
              icon: <Copy className="h-4 w-4" />,
            },
            {
              permission: 'procurement.pay',
              onClick: async () => navigate(`/procurements/pay/${item.seq}`),
              label: t('table.pay'),
              icon: <CreditCard className="h-4 w-4" />,
            },
            {
              permission: 'procurement.pay',
              onClick: async () => navigate(`/procurements/accept/${item.seq}`),
              label: t('table.accept'),
              icon: <Check className="h-4 w-4" />,
            },
            {
              permission: 'procurement.delete',
              onClick: () => removeProcurement({ ids: [item.id] }),
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
      columnHelper.display({
        id: 'seq',
        meta: {
          title: t('table.seq'),
          filterable: true,
          filterType: 'number',
          sortable: true,
        },
        cell: ({ row }) => row.original.seq,
      }),
      columnHelper.display({
        id: 'supplier',
        size: 150,
        meta: {
          title: t('page.procurements.table.supplier'),
          filterable: true,
          filterType: 'select',
          sortable: true,
          defaultVisible: true,
        },
        header: () => t('page.procurements.table.supplier'),
        cell: ({ row }) => <Badge variant="outline">{row.original.supplier.name}</Badge>,
      }),
      columnHelper.accessor('status', {
        id: 'status',
        meta: {
          title: t('page.procurements.table.status'),
          filterable: true,
          filterType: 'select',
        },
        header: () => t('page.procurements.table.status'),
        cell: ({ row }) => {
          const badgeType = {
            draft: 'default',
            confirmed: 'success',
            cancelled: 'destructive',
            received: 'success',
          } as const
          const status = row.original.status
          return (
            <Badge variant={badgeType[status as keyof typeof badgeType] ?? 'default'}>
              {t(`page.procurements.status.${(status || '').toLowerCase()}`)}
            </Badge>
          )
        },
      }),
      columnHelper.display({
        id: 'payments',
        meta: {
          title: t('page.procurements.table.payments'),
        },
        header: () => t('page.procurements.table.payments'),
        cell: ({ row }) => {
          const payments = row.original.paymentsByCurrency || []
          return (
            <div className="flex flex-col gap-2">
              {payments.map(item => (
                <Badge key={item.currency.id}>
                  {`${item.amount} ${item.currency.symbols[language] || ''}`}
                </Badge>
              ))}
            </div>
          )
        },
      }),
      columnHelper.display({
        id: 'total',
        meta: {
          title: t('page.procurements.table.total'),
        },
        header: () => t('page.procurements.table.total'),
        cell: ({ row }) => {
          const total = row.original.itemsByCurrency || []
          return (
            <div className="flex flex-col gap-2">
              {total.map(item => (
                <Badge key={item.currency.id}>
                  {`${item.amount} ${item.currency.symbols[language] || ''}`}
                </Badge>
              ))}
            </div>
          )
        },
      }),
      columnHelper.display({
        id: 'debt',
        meta: {
          title: t('page.procurements.table.debt'),
        },
        header: () => t('page.procurements.table.debt'),
        cell: ({ row }) => {
          const debt = row.original.balanceByCurrency || []
          return (
            <div className="flex flex-col gap-2">
              {debt.map(item => (
                <Badge key={item.currency.id}>
                  {`${item.amount} ${item.currency.symbols[language] || ''}`}
                </Badge>
              ))}
            </div>
          )
        },
      }),
      columnHelper.display({
        id: 'paymentStatus',
        meta: {
          title: t('page.procurements.table.paymentStatus'),
        },
        header: () => t('page.procurements.table.paymentStatus'),
        cell: ({ row }) => {
          const paymentStatus = row.original.paymentStatus ?? ''
          const paymentStatusVariant = {
            'paid': 'success',
            'partially-paid': 'warning',
            'unpaid': 'destructive',
            'overpaid': 'warning',
          } as const

          const variant = paymentStatusVariant[paymentStatus as keyof typeof paymentStatusVariant] ?? 'default'

          return (
            <div className="flex flex-col gap-2">
              <Badge variant={variant}>
                {t(`page.procurements.paymentStatus.${paymentStatus}`)}
              </Badge>
            </div>
          )
        },
      }),
      columnHelper.accessor('comment', {
        id: 'comment',
        meta: {
          title: t('page.procurements.table.comment'),
        },
        header: () => t('page.procurements.table.comment'),
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
        header: () => t('table.updatedAt'),
        cell: ({ row }) => formatDate(row.getValue('updatedAt'), 'dd.MM.yyyy HH:mm', language),
      }),
      actionColumn(),
    ]
  }, [language, navigate, removeProcurement, t])

  return columns
}
