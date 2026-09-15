import type { MoneyTransactionDTO } from '@remnant/shared'
import type { ReactNode } from 'react'
import { Badge, TableCell, TableRow } from '@/components/ui'
import { formatDate } from '@/utils/helpers'
import { useLocale } from '@/utils/hooks'

function ActorBadge({
  name,
  variant,
  empty,
}: {
  name?: string | null
  variant: 'outline' | 'success' | 'destructive'
  empty: string
}) {
  if (!name)
    return <span className="text-muted-foreground">{empty}</span>

  return <Badge variant={variant}>{name}</Badge>
}

function Detail({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex min-w-40 flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="min-h-6 flex items-center">{children}</div>
    </div>
  )
}

export function MoneyTransactionExpandedRow({
  item,
  columnsLength,
}: {
  item: MoneyTransactionDTO
  columnsLength: number
}) {
  const { t, language } = useLocale()
  const empty = t('page.money-transactions.table.empty')

  return (
    <TableRow>
      <TableCell colSpan={columnsLength} className="bg-muted/40 px-6 py-4">
        <div className="flex flex-wrap gap-x-8 gap-y-4">
          <Detail label={t('page.money-transactions.table.createdBy')}>
            <ActorBadge name={item.createdBy?.name} variant="outline" empty={empty} />
          </Detail>
          <Detail label={t('page.money-transactions.table.confirmedBy')}>
            <ActorBadge name={item.confirmedBy?.name} variant="success" empty={empty} />
          </Detail>
          <Detail label={t('page.money-transactions.table.cancelledBy')}>
            <ActorBadge name={item.cancelledBy?.name} variant="destructive" empty={empty} />
          </Detail>
          <Detail label={t('page.money-transactions.table.sourceModel')}>
            <Badge variant="outline">
              {t(`page.money-transactions.table.sourceModel.${item.sourceModel.toLowerCase()}`)}
            </Badge>
          </Detail>
          <Detail label={t('page.money-transactions.table.description')}>
            <span className="text-sm">{item.description?.trim() || empty}</span>
          </Detail>
          <Detail label={t('table.createdAt')}>
            <span className="text-sm tabular-nums">
              {formatDate(item.createdAt, 'dd.MM.yyyy HH:mm:ss', language)}
            </span>
          </Detail>
          <Detail label={t('page.money-transactions.table.confirmedAt')}>
            <span className="text-sm tabular-nums">
              {item.confirmedAt
                ? formatDate(item.confirmedAt, 'dd.MM.yyyy HH:mm:ss', language)
                : empty}
            </span>
          </Detail>
          <Detail label={t('page.money-transactions.table.cancelledAt')}>
            <span className="text-sm tabular-nums">
              {item.cancelledAt
                ? formatDate(item.cancelledAt, 'dd.MM.yyyy HH:mm:ss', language)
                : empty}
            </span>
          </Detail>
        </div>
      </TableCell>
    </TableRow>
  )
}
