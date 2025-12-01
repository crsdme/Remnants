import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronsUpDown,
  Copy,
  CreditCard,
  Pencil,
  Trash,
} from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useNavigate } from 'react-router-dom'
import { TableActionDropdown } from '@/components'
import { Badge, Button } from '@/components/ui'
import { formatDate } from '@/utils/helpers'
import { useProcurementContext } from '../context'

const sortIcons = { asc: ArrowUp, desc: ArrowDown }

export function useColumns() {
  const { t, i18n } = useTranslation()
  const { removeProcurement } = useProcurementContext()
  const navigate = useNavigate()

  const columns = useMemo(() => {
    function sortHeader(column, label) {
      const Icon = sortIcons[column.getIsSorted() || undefined] || ChevronsUpDown

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
              permission: 'procurement.copy',
              onClick: () => navigator.clipboard.writeText(item.id),
              label: t('table.copy'),
              icon: <Copy className="h-4 w-4" />,
            },
            // {
            //   permission: 'procurement.edit',
            //   onClick: async () => await editModal(item),
            //   label: t('table.edit'),
            //   icon: <Pencil className="h-4 w-4" />,
            // },
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
      {
        id: 'seq',
        meta: {
          title: t('table.seq'),
          filterable: true,
          filterType: 'number',
          sortable: true,
        },
        cell: ({ row }) => row.original.seq,
      },
      {
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
      },
      {
        id: 'status',
        accessorKey: 'status',
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
          }
          return <Badge variant={badgeType[row.original.status]}>{t(`page.procurements.status.${(row.original?.status || '').toLowerCase()}`)}</Badge>
        },
      },
      {
        id: 'payments',
        accessorKey: 'payments',
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
                  {`${item.amount} ${item.currency.symbols[i18n.language] || ''}`}
                </Badge>
              ))}
            </div>
          )
        },
      },
      {
        id: 'total',
        accessorKey: 'total',
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
                  {`${item.amount} ${item.currency.symbols[i18n.language] || ''}`}
                </Badge>
              ))}
            </div>
          )
        },
      },
      {
        id: 'debt',
        accessorKey: 'debt',
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
                  {`${item.amount} ${item.currency.symbols[i18n.language] || ''}`}
                </Badge>
              ))}
            </div>
          )
        },
      },
      {
        id: 'paymentStatus',
        accessorKey: 'paymentStatus',
        meta: {
          title: t('page.procurements.table.paymentStatus'),
        },
        header: () => t('page.procurements.table.paymentStatus'),
        cell: ({ row }) => {
          const paymentStatus = row.original.paymentStatus
          const paymentStatusVariant = {
            'paid': 'success',
            'partially-paid': 'warning',
            'unpaid': 'destructive',
            'overpaid': 'warning',
          }

          return (
            <div className="flex flex-col gap-2">
              <Badge variant={paymentStatusVariant[paymentStatus]}>
                {t(`page.procurements.paymentStatus.${paymentStatus}`)}
              </Badge>
            </div>
          )
        },
      },
      {
        id: 'comment',
        accessorKey: 'comment',
        meta: {
          title: t('page.procurements.table.comment'),
        },
        header: () => t('page.procurements.table.comment'),
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
        header: () => t('table.updatedAt'),
        cell: ({ row }) => formatDate(row.getValue('updatedAt'), 'dd.MM.yyyy HH:mm', i18n.language),
      },
      actionColumn(),
    ]
  }, [i18n.language])
  return columns
}
