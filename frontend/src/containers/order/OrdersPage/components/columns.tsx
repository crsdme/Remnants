import type { OrderDTOPopulated } from '@remnant/shared'
import type { Column } from '@tanstack/react-table'
import { createColumnHelper } from '@tanstack/react-table'
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  Copy,
  Eye,
  Pencil,
  Printer,
  Trash,
} from 'lucide-react'
import { useMemo } from 'react'

import { useNavigate } from 'react-router-dom'
import { TableActionDropdown } from '@/components'
import { Badge, Button, Checkbox } from '@/components/ui'
import { useAuthContext } from '@/contexts'

import { backendUrl } from '@/utils/constants'
import { formatDate } from '@/utils/helpers'
import { hasPermission } from '@/utils/helpers/permission'
import { useLocale } from '@/utils/hooks'
import { useOrderContext } from '../context'

const sortIcons = { asc: ArrowUp, desc: ArrowDown }

type OrderPaymentStatus = 'paid' | 'unpaid' | 'partially_paid' | 'overpaid'

const columnHelper = createColumnHelper<OrderDTOPopulated>()

const paymentBadgeVariant: Record<OrderPaymentStatus, 'success' | 'destructive' | 'warning'> = {
  paid: 'success',
  unpaid: 'destructive',
  partially_paid: 'warning',
  overpaid: 'warning',
}

export function useColumns() {
  const { t, language } = useLocale()
  const { isLoading, removeOrder, currencies } = useOrderContext()
  const { permissions } = useAuthContext()
  const navigate = useNavigate()

  const columns = useMemo(() => {
    function sortHeader(column: Column<OrderDTOPopulated>, label: string) {
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
              permission: 'order.page',
              onClick: () => void navigate(`/orders/view/${item.seq}`),
              label: t('table.view'),
              icon: <Eye className="h-4 w-4" />,
            },
            {
              permission: 'order.print.order-label',
              link: `${backendUrl}api/orders/print/order-label?seq=${item.seq}&language=${language}`,
              type: 'link' as const,
              label: t('table.printLabel'),
              icon: <Printer className="h-4 w-4" />,
            },
            {
              permission: 'order.print.invoice',
              link: `${backendUrl}api/orders/print/invoice?seq=${item.seq}&language=${language}`,
              type: 'link' as const,
              label: t('table.printInvoice'),
              icon: <Printer className="h-4 w-4" />,
            },
          ] as any[]

          if (!item.orderStatus.isLocked || hasPermission(permissions, ['order.editLocked', 'order.removeLocked'])) {
            actions.push({
              permission: 'other.admin',
              onClick: () => void navigator.clipboard.writeText(item.id),
              label: t('table.copy'),
              icon: <Copy className="h-4 w-4" />,
            })
            actions.push({
              permission: 'order.edit',
              onClick: () => void navigate(`/orders/edit/${item.seq}`),
              label: t('table.edit'),
              icon: <Pencil className="h-4 w-4" />,
            })
            actions.push({
              permission: 'order.remove',
              onClick: () => removeOrder({ ids: [item.id] }),
              label: t('table.delete'),
              icon: <Trash className="h-4 w-4" />,
              isDestructive: true,
              isConfirm: true,
            })
          }

          return <TableActionDropdown actions={actions} />
        },
      })
    }

    function permissionColumns() {
      if (!hasPermission(permissions, 'order.profit'))
        return []

      return [
        columnHelper.display({
          id: 'profit',
          size: 150,
          meta: {
            title: t('page.orders.table.profit'),
            sortable: false,
            filterable: false,
          },
          header: () => t('page.orders.table.profit'),
          cell: ({ row }) => {
            const profit = row.original.profit
            return (
              <div className="flex flex-col gap-2">
                {profit.map((item: any) => (
                  <Badge key={item.currency}>
                    {`${item.total} ${currencies.find(currency => currency.id === item.currency)?.symbols[language] || ''}`}
                  </Badge>
                ))}
              </div>
            )
          },
        }),
      ]
    }

    return [
      selectColumn(),
      columnHelper.accessor('seq', {
        id: 'seq',
        size: 150,
        meta: {
          title: t('page.orders.table.seq'),
          batchEdit: true,
          batchEditType: 'textMultiLanguage',
          filterable: true,
          filterType: 'text',
          sortable: true,
          defaultVisible: true,
        },
        header: ({ column }) => sortHeader(column, t('page.orders.table.seq')),
      }),
      columnHelper.accessor('client', {
        id: 'client',
        size: 150,
        meta: {
          title: t('page.orders.table.client'),
          batchEdit: true,
          batchEditType: 'textMultiLanguage',
          filterable: true,
          filterType: 'text',
          sortable: true,
          defaultVisible: true,
        },
        header: ({ column }) => sortHeader(column, t('page.orders.table.client')),
        cell: ({ row }) => {
          const client = row.original.client
          if (!client || Object.keys(client).length === 0)
            return null
          return (
            <>
              <div>{`${client.name ?? ''} ${client.lastName ?? ''} ${client.middleName ?? ''}`}</div>
              <div>{client.phones?.join(', ')}</div>
              <div>{client.emails?.join(', ')}</div>
            </>
          )
        },
      }),
      columnHelper.accessor(row => row.warehouse.names?.[language], {
        id: 'warehouse',
        size: 150,
        meta: {
          title: t('page.orders.table.warehouse'),
          batchEdit: true,
          batchEditType: 'textMultiLanguage',
          filterable: true,
          filterType: 'text',
          sortable: true,
          defaultVisible: true,
        },
        header: ({ column }) => sortHeader(column, t('page.orders.table.warehouse')),
        cell: ({ row }) => (
          <Badge variant="outline">{row.original.warehouse.names?.[language]}</Badge>
        ),
      }),
      columnHelper.accessor(row => row.deliveryService.names?.[language], {
        id: 'deliveryService',
        size: 150,
        meta: {
          title: t('page.orders.table.deliveryService'),
          batchEdit: true,
          batchEditType: 'textMultiLanguage',
          filterable: true,
          filterType: 'text',
          sortable: true,
          defaultVisible: true,
        },
        header: ({ column }) => sortHeader(column, t('page.orders.table.deliveryService')),
        cell: ({ row }) => (
          <Badge variant="outline">{row.original.deliveryService.names?.[language]}</Badge>
        ),
      }),
      columnHelper.accessor(row => row.orderSource.names?.[language], {
        id: 'orderSource',
        size: 150,
        meta: {
          title: t('page.orders.table.orderSource'),
          batchEdit: true,
          batchEditType: 'textMultiLanguage',
          filterable: true,
          filterType: 'text',
          sortable: true,
          defaultVisible: true,
        },
        header: ({ column }) => sortHeader(column, t('page.orders.table.orderSource')),
        cell: ({ row }) => (
          <Badge variant="outline">{row.original.orderSource.names?.[language]}</Badge>
        ),
      }),
      columnHelper.accessor(row => row.orderStatus.names?.[language], {
        id: 'orderStatus',
        size: 150,
        meta: {
          title: t('page.orders.table.orderStatus'),
          batchEdit: true,
          batchEditType: 'textMultiLanguage',
          filterable: true,
          filterType: 'text',
          sortable: true,
          defaultVisible: true,
        },
        header: ({ column }) => sortHeader(column, t('page.orders.table.orderStatus')),
        cell: ({ row }) => (
          <Badge variant="outline">{row.original.orderStatus.names?.[language]}</Badge>
        ),
      }),
      columnHelper.accessor('orderPaymentStatus', {
        id: 'orderPaymentStatus',
        size: 150,
        meta: {
          title: t('page.orders.table.orderPaymentStatus'),
          batchEdit: true,
          batchEditType: 'textMultiLanguage',
          filterable: true,
          filterType: 'text',
          sortable: true,
          defaultVisible: true,
        },
        header: ({ column }) => sortHeader(column, t('page.orders.table.orderPaymentStatus')),
        cell: ({ row }) => {
          const orderPaymentStatus = row.original.orderPaymentStatus
          return (
            <Badge variant={paymentBadgeVariant[orderPaymentStatus as OrderPaymentStatus]}>
              {t(`order-payment.${orderPaymentStatus}`)}
            </Badge>
          )
        },
      }),
      ...permissionColumns(),
      columnHelper.display({
        id: 'totals',
        size: 150,
        meta: {
          title: t('page.orders.table.totals'),
          sortable: false,
          filterable: false,
        },
        header: () => t('page.orders.table.totals'),
        cell: ({ row }) => {
          const totals = row.original.totals
          return (
            <div className="flex flex-col gap-2">
              {totals.map(item => (
                <Badge key={item.currency}>
                  {`${item.total} ${currencies.find(currency => currency.id === item.currency)?.symbols[language] || ''}`}
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
  }, [language, currencies, isLoading, navigate, permissions, removeOrder, t])
  return columns
}
