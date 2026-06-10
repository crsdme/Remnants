import type { CashregisterPopulatedDTO } from '@remnant/shared'
import type { Column } from '@tanstack/react-table'
import { createColumnHelper } from '@tanstack/react-table'
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

import { TableActionDropdown } from '@/components'
import { Badge, Button, Checkbox } from '@/components/ui'
import { formatDate } from '@/utils/helpers'
import { useLocale } from '@/utils/hooks'
import { useCashregisterContext } from '../context'

const sortIcons = { asc: ArrowUp, desc: ArrowDown }
const columnHelper = createColumnHelper<CashregisterPopulatedDTO>()

export function useColumns() {
  const { t, language } = useLocale()
  const { isLoading, openModal, removeCashregister } = useCashregisterContext()

  const columns = useMemo(() => {
    function sortHeader(column: Column<CashregisterPopulatedDTO>, label: string) {
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
              permission: 'cashregister.copy',
              onClick: async () => navigator.clipboard.writeText(item.id),
              label: t('table.copy'),
              icon: <Copy className="h-4 w-4" />,
            },
            {
              permission: 'cashregister.edit',
              onClick: () => openModal(item),
              label: t('table.edit'),
              icon: <Pencil className="h-4 w-4" />,
            },
            {
              permission: 'cashregister.delete',
              onClick: () => removeCashregister({ ids: [item.id] }),
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
      expanderColumn(),
      columnHelper.accessor('names', {
        id: 'names',
        size: 150,
        meta: {
          title: t('page.cashregisters.table.names'),
          batchEdit: true,
          batchEditType: 'textMultiLanguage',
          filterable: true,
          filterType: 'text',
          sortable: true,
          defaultVisible: true,
        },
        header: ({ column }) => sortHeader(column, t('page.cashregisters.table.names')),
        cell: ({ getValue }) => getValue()?.[language] ?? getValue()?.en,
      }),
      columnHelper.display({
        id: 'balance',
        meta: {
          title: t('page.cashregisters.table.balance'),
          defaultVisible: true,
        },
        header: t('page.cashregisters.table.balance'),
        cell: ({ row }) => {
          const accounts = row.original.accounts || []
          if (accounts.length === 0)
            return <Badge variant="outline">{t('page.cashregisters.table.balance.empty')}</Badge>

          return (
            <div className="flex flex-col gap-2">
              {accounts.map((account) => {
                const currencies = account.currencies || []
                return (
                  <div className="flex gap-2" key={account.id}>
                    <Badge>{account.names?.[language]}</Badge>
                    {currencies.map((currency) => {
                      return <Badge key={currency.id} variant="outline">{`${currency.balance} ${currency.symbols?.[language]}`}</Badge>
                    })}
                  </div>
                )
              })}
            </div>
          )

          // return accounts.map(account => (
          //   <Badge key={account.id} variant="outline">{`${account.names?.[i18n.language]} ${account.balance} ${account.currencies.map(currency => currency.symbols?.[i18n.language]).join(', ')}`}</Badge>
          // ))
        },
      }),
      columnHelper.accessor('priority', {
        id: 'priority',
        meta: {
          title: t('page.cashregisters.table.priority'),
          batchEdit: true,
          batchEditType: 'number',
          filterable: true,
          filterType: 'number',
          sortable: true,
        },
        header: ({ column }) => sortHeader(column, t('page.cashregisters.table.priority')),
        cell: ({ getValue }) => <Badge variant="outline">{getValue()}</Badge>,
      }),
      columnHelper.accessor('active', {
        id: 'active',
        meta: {
          title: t('page.cashregisters.table.active'),
          batchEdit: true,
          batchEditType: 'boolean',
          filterable: true,
          filterType: 'boolean',
          sortable: true,
        },
        header: t('page.cashregisters.table.active'),
        cell: ({ getValue }) => {
          const isActive = getValue()
          return <Badge variant={isActive ? 'success' : 'destructive'}>{t(`table.active.${isActive}`)}</Badge>
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
        cell: ({ getValue }) => formatDate(getValue(), 'dd.MM.yyyy HH:mm', language),
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
        cell: ({ getValue }) => formatDate(getValue(), 'dd.MM.yyyy HH:mm', language),
      }),
      actionColumn(),
    ]
  }, [language, isLoading, openModal, removeCashregister, t])
  return columns
}
