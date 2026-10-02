import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'

import { PermissionGate } from '@/components/PermissionGate'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui'
import { fromMinor } from '@/utils/helpers'
import { useLocale } from '@/utils/hooks'

import { useBalanceContext } from '../context'
import { ChartAreaInteractive } from './chart'
import { useColumns } from './columns'
import { BalanceDetail } from './detail'

export function DataTable() {
  const { t } = useTranslation()
  const { language } = useLocale()
  const {
    balances,
    currentBalance,
    currencies,
    selectedBalance,
    isDetailOpen,
    openDetail,
    closeDetail,
  } = useBalanceContext()
  const columns = useColumns()

  const table = useReactTable({
    data: balances,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <div>
            <CardTitle>{t('page.balances.current.title')}</CardTitle>
            <CardDescription>{t('page.balances.current.description')}</CardDescription>
          </div>
          <PermissionGate permission={['balance.get-current']}>
            <Button
              variant="outline"
              disabled={!currentBalance}
              onClick={() => currentBalance && openDetail(currentBalance)}
            >
              {t('page.balances.table.detail')}
            </Button>
          </PermissionGate>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4 text-sm">
          {(currentBalance?.totalBalances ?? []).length === 0
            ? <span className="text-muted-foreground">{t('page.balances.detail.empty')}</span>
            : (currentBalance?.totalBalances ?? []).map((row) => {
                const currency = currencies.find(item => item.id === row.currencyId)
                const symbol = currency?.symbols?.[language as 'en' | 'ru'] ?? currency?.symbols?.en ?? ''
                return (
                  <div key={row.currencyId} className="font-medium">
                    {fromMinor(Number(row.minorAmount) || 0, currency?.scale ?? 2)}
                    {' '}
                    {symbol}
                  </div>
                )
              })}
        </CardContent>
      </Card>

      <ChartAreaInteractive />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length
              ? table.getRowModel().rows.map(row => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                      {t('page.balances.table.empty')}
                    </TableCell>
                  </TableRow>
                )}
          </TableBody>
        </Table>
      </div>

      <Sheet open={isDetailOpen} onOpenChange={open => !open && closeDetail()}>
        <SheetContent className="sm:max-w-xl w-full overflow-y-auto" side="right">
          <SheetHeader>
            <SheetTitle>{t('page.balances.detail.title')}</SheetTitle>
            <SheetDescription>{t('page.balances.detail.description')}</SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-4">
            {selectedBalance ? <BalanceDetail balance={selectedBalance} /> : null}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
