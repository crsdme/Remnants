import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  Copy,
  Eye,
  Pencil,
  Trash,
} from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useNavigate } from 'react-router-dom'
import { TableActionDropdown } from '@/components'
import { Badge, Button, Checkbox } from '@/components/ui'
import { useAuthContext, useOrderContext } from '@/contexts'
import { formatDate } from '@/utils/helpers'
import { hasPermission } from '@/utils/helpers/permission'

const sortIcons = { asc: ArrowUp, desc: ArrowDown }

export function useColumns() {
  const { t, i18n } = useTranslation()
  const { isLoading, removeOrder, currencies } = useOrderContext()
  const { permissions } = useAuthContext()
  const navigate = useNavigate()

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

          const actions = [{
            permission: 'order.page',
            onClick: () => navigate(`/orders/view/${item.seq}`),
            label: t('table.view'),
            icon: <Eye className="h-4 w-4" />,
          }] as any

          if (!item.orderStatus.isLocked || hasPermission(permissions, ['order.editLocked', 'order.removeLocked'])) {
            actions.push({
              permission: 'other.admin',
              onClick: () => navigator.clipboard.writeText(item.id),
              label: t('table.copy'),
              icon: <Copy className="h-4 w-4" />,
            })
            actions.push({
              permission: 'order.edit',
              onClick: () => navigate(`/orders/edit/${item.seq}`),
              label: t('table.edit'),
              icon: <Pencil className="h-4 w-4" />,
            })
            actions.push({
              permission: 'order.remove',
              onClick: () => removeOrder({ ids: [item.id] }),
              label: t('table.delete'),
              icon: <Trash className="h-4 w-4" />,
              isDestructive: true,
            })
          }

          return <TableActionDropdown actions={actions} />
        },
      })
    }

    return [
      selectColumn(),
      {
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
        accessorFn: row => row.seq,
      },
      {
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
          if (Object.keys(client).length === 0)
            return null
          return (
            <>
              <div>{`${client.name} ${client.lastName} ${client.middleName}`}</div>
              <div>{client.phones.join(', ')}</div>
              <div>{client.emails.join(', ')}</div>
            </>
          )
        },
      },
      {
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
        cell: ({ row }) => {
          const warehouse = row.original.warehouse
          return (
            <Badge variant="outline">{warehouse.names?.[i18n.language]}</Badge>
          )
        },
      },
      {
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
        cell: ({ row }) => {
          const deliveryService = row.original.deliveryService
          return (
            <Badge variant="outline">{deliveryService.names?.[i18n.language]}</Badge>
          )
        },
      },
      {
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
        cell: ({ row }) => {
          const orderSource = row.original.orderSource
          return (
            <Badge variant="outline">{orderSource.names?.[i18n.language]}</Badge>
          )
        },
      },
      {
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
        cell: ({ row }) => {
          const orderStatus = row.original.orderStatus
          return (
            <Badge variant="outline">{orderStatus.names?.[i18n.language]}</Badge>
          )
        },
      },
      {
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

          const badgeVariant = {
            paid: 'success',
            unpaid: 'destructive',
            partially_paid: 'warning',
            overpaid: 'warning',
          }

          return (
            <Badge variant={badgeVariant[orderPaymentStatus]}>{t(`order-payment.${orderPaymentStatus}`)}</Badge>
          )
        },
      },
      {
        id: 'totals',
        size: 150,
        meta: {
          title: t('page.orders.table.totals'),
        },
        header: ({ column }) => sortHeader(column, t('page.orders.table.totals')),
        cell: ({ row }) => {
          const totals = row.original.totals
          return (
            <div className="flex flex-col gap-2">
              {totals.map(item => (
                <Badge key={item.currency}>
                  {`${item.total} ${currencies.find(currency => currency.id === item.currency)?.symbols[i18n.language] || ''}`}
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
  }, [i18n.language, currencies, isLoading])
  return columns
}
