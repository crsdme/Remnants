import { CircleCheck, CreditCard, Plus, Trash2 } from 'lucide-react'
import {
  Button,
  Separator,
} from '@/components/ui'
import { formatDate } from '@/utils/helpers/formatDate'
import { useLocale } from '@/utils/hooks'

export interface OrderPaymentListItem {
  id: string
  amount: number
  paymentDate?: Date
  comment?: string
  cashregister: { names: { [key: string]: string } }
  cashregisterAccount: { names: { [key: string]: string } }
  currency: { id?: string, symbols: { [key: string]: string } }
}

interface OrderPaymentsListProps {
  payments: OrderPaymentListItem[]
  title: string
  addLabel?: string
  onAdd?: () => void
  onRemove?: (id: string) => void
  disabled?: boolean
}

export function OrderPaymentsList({
  payments,
  title,
  addLabel,
  onAdd,
  onRemove,
  disabled,
}: OrderPaymentsListProps) {
  const { language } = useLocale()

  if (!onAdd && payments.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <CreditCard className="size-5 shrink-0" />
        <p className="text-lg font-bold">{title}</p>
        <Separator className="flex-1" />
        {onAdd && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-auto shrink-0 gap-1 px-0 text-muted-foreground"
            onClick={onAdd}
            disabled={disabled}
          >
            <Plus className="size-3.5" />
            {addLabel}
          </Button>
        )}
      </div>

      {payments.length > 0 && (
        <ul className="space-y-2">
          {payments.map((payment) => {
            const meta = [
              payment.cashregister.names[language],
              payment.cashregisterAccount.names[language],
              payment.paymentDate
                ? formatDate(payment.paymentDate, 'PP', language)
                : null,
              payment.comment || null,
            ].filter(Boolean).join(' · ')

            return (
              <li
                key={payment.id}
                className="rounded-lg border bg-card px-3 py-2.5"
              >
                <div className="flex items-start gap-2.5">
                  <CircleCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-base font-semibold tabular-nums leading-none">
                        {payment.amount}
                        {' '}
                        {payment.currency.symbols[language]}
                      </p>
                      {onRemove && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() => onRemove(payment.id)}
                          disabled={disabled}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      )}
                    </div>
                    {meta && (
                      <p className="mt-1.5 truncate text-sm text-muted-foreground">
                        {meta}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
