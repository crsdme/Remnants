import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, CreditCard, Wallet } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useClientPay } from '@/api/hooks'
import { PermissionGate } from '@/components'
import { Button } from '@/components/ui'
import { useViewClientContext } from '../context'

export function ActionBar() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { client, setPayOpen } = useViewClientContext()

  const creditCurrencyId = useMemo(() => {
    const credits = (client?.balances ?? []).filter(row => row.amount < 0)
    const debts = (client?.debts ?? []).filter(row => row.amount > 0)
    if (credits.length === 0 || debts.length === 0)
      return null
    return credits.find(credit => debts.some(debt => debt.currency.id === credit.currency.id))?.currency.id
      ?? credits[0].currency.id
  }, [client])

  const { mutate: payFromCredit, isPending: isPayingFromCredit } = useClientPay({
    options: {
      onSuccess: ({ data }) => {
        void queryClient.invalidateQueries({ queryKey: ['orders'] })
        void queryClient.invalidateQueries({ queryKey: ['payment-applications'] })
        void queryClient.invalidateQueries({ queryKey: ['money-transactions'] })
        void queryClient.invalidateQueries({ queryKey: ['clients'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data?.message ?? ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <Button variant="ghost" onClick={() => void navigate('/clients')}>
          <ArrowLeft className="h-4 w-4" />
          {t('button.back')}
        </Button>
      </div>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {client?.seq
              ? t('page.clients.view.title-with-seq', { seq: client.seq })
              : t('page.clients.view.title')}
          </h2>
          <p className="text-muted-foreground">{t('page.clients.view.description')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {creditCurrencyId && client && (
            <PermissionGate permission="client.edit">
              <Button
                type="button"
                variant="outline"
                loading={isPayingFromCredit}
                disabled={isPayingFromCredit}
                onClick={() => payFromCredit({
                  clientId: client.id,
                  currency: creditCurrencyId,
                })}
              >
                <Wallet className="size-4" />
                {t('page.clients.view.pay-from-credit')}
              </Button>
            </PermissionGate>
          )}
          <PermissionGate permission="client.edit">
            <Button type="button" onClick={() => setPayOpen(true)}>
              <CreditCard className="size-4" />
              {t('page.clients.view.pay')}
            </Button>
          </PermissionGate>
        </div>
      </div>
    </>
  )
}
