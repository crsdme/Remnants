import type { BalanceDTO, CurrencyDTO } from '@remnant/shared'
import type { Column } from '@tanstack/react-table'

import { createColumnHelper } from '@tanstack/react-table'
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  Copy,
  Eye,
  Trash,
} from 'lucide-react'
import { useMemo } from 'react'

import { TableActionDropdown } from '@/components'
import { Button } from '@/components/ui'
import { formatDate, fromMinor } from '@/utils/helpers'
import { useLocale } from '@/utils/hooks'

import { useBalanceContext } from '../context'

const sortIcons = { asc: ArrowUp, desc: ArrowDown }
const columnHelper = createColumnHelper<BalanceDTO>()

function formatTotals(
  totals: Array<{ currencyId: string, minorAmount: number }> | undefined,
  currencies: CurrencyDTO[],
  language: string,
) {
  if (!totals?.length)
    return '—'
  return totals.map((row) => {
    const currency = currencies.find(item => item.id === row.currencyId)
    const scale = currency?.scale ?? 2
    const symbol = currency?.symbols?.[language as 'en' | 'ru'] ?? currency?.symbols?.en ?? ''
    return `${fromMinor(Number(row.minorAmount) || 0, scale)} ${symbol}`.trim()
  }).join(', ')
}

export function useColumns() {
  const { t, language } = useLocale()
  const { isLoading, currencies, openDetail, removeBalance } = useBalanceContext()

  const columns = useMemo(() => {
    function sortHeader(column: Column<BalanceDTO, unknown>, label: string) {
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

    return [
      columnHelper.accessor('seq', {
        id: 'seq',
        size: 80,
        meta: {
          title: t('page.balances.table.seq'),
          sortable: true,
          defaultVisible: true,
        },
        header: ({ column }) => sortHeader(column, t('page.balances.table.seq')),
      }),
      columnHelper.accessor(row => formatTotals(row.totalBalances, currencies, language), {
        id: 'totalBalances',
        size: 220,
        meta: {
          title: t('page.balances.table.total'),
          defaultVisible: true,
        },
        header: () => t('page.balances.table.total'),
      }),
      columnHelper.accessor(row => row.comment ?? '', {
        id: 'comment',
        size: 200,
        meta: {
          title: t('page.balances.table.comment'),
          defaultVisible: true,
        },
        header: () => t('page.balances.table.comment'),
      }),
      columnHelper.accessor('createdAt', {
        id: 'createdAt',
        size: 160,
        meta: {
          title: t('table.createdAt'),
          sortable: true,
          defaultVisible: true,
        },
        header: ({ column }) => sortHeader(column, t('table.createdAt')),
        cell: ({ row }) => row.original.createdAt
          ? formatDate(row.original.createdAt, 'dd.MM.yyyy HH:mm', language)
          : '—',
      }),
      columnHelper.display({
        id: 'action',
        size: 85,
        meta: { title: t('table.actions') },
        enableHiding: false,
        cell: ({ row }) => {
          const item = row.original
          return (
            <TableActionDropdown
              actions={[
                {
                  permission: 'balance.get-current',
                  onClick: () => openDetail(item),
                  label: t('page.balances.table.detail'),
                  icon: <Eye className="h-4 w-4" />,
                },
                {
                  permission: 'balance.copy',
                  onClick: async () => navigator.clipboard.writeText(item.id),
                  label: t('table.copy'),
                  icon: <Copy className="h-4 w-4" />,
                },
                {
                  permission: 'balance.remove',
                  onClick: () => removeBalance({ ids: [item.id] }),
                  label: t('table.delete'),
                  icon: <Trash className="h-4 w-4" />,
                  isDestructive: true,
                  isConfirm: true,
                },
              ]}
            />
          )
        },
      }),
    ]
  }, [currencies, isLoading, language, openDetail, removeBalance, t])

  return columns
}
