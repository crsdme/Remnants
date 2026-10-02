import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, CreditCard, Wallet } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useSupplierPay } from '@/api/hooks'
import { PermissionGate } from '@/components'
import { Button } from '@/components/ui'
import { useViewSupplierContext } from '../context'

export function ActionBar() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { supplier, setPayOpen } = useViewSupplierContext()

  const creditCurrencyId = useMemo(() => {
    const credits = (supplier?.balances ?? []).filter(row => row.amount < 0)
    const debts = (supplier?.debts ?? []).filter(row => row.amount > 0)
    if (credits.length === 0 || debts.length === 0)
      return null
    return credits.find(credit => debts.some(debt => debt.currency.id === credit.currency.id))?.currency.id
      ?? credits[0].currency.id
  }, [supplier])

  const { mutate: payFromCredit, isPending: isPayingFromCredit } = useSupplierPay({
    options: {
      onSuccess: ({ data }) => {
        void queryClient.invalidateQueries({ queryKey: ['procurements'] })
        void queryClient.invalidateQueries({ queryKey: ['payment-applications'] })
        void queryClient.invalidateQueries({ queryKey: ['money-transactions'] })
        void queryClient.invalidateQueries({ queryKey: ['suppliers'] })
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
        <Button variant="ghost" onClick={() => void navigate('/suppliers')}>
          <ArrowLeft className="h-4 w-4" />
          {t('button.back')}
        </Button>
      </div>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {supplier?.seq
              ? t('page.suppliers.view.title-with-seq', { seq: supplier.seq })
              : t('page.suppliers.view.title')}
          </h2>
          <p className="text-muted-foreground">{t('page.suppliers.view.description')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {creditCurrencyId && supplier && (
            <PermissionGate permission="procurement.pay">
              <Button
                type="button"
                variant="outline"
                loading={isPayingFromCredit}
                disabled={isPayingFromCredit}
                onClick={() => payFromCredit({
                  supplierId: supplier.id,
                  currency: creditCurrencyId,
                })}
              >
                <Wallet className="size-4" />
                {t('page.suppliers.view.pay-from-credit')}
              </Button>
            </PermissionGate>
          )}
          <PermissionGate permission="procurement.pay">
            <Button type="button" onClick={() => setPayOpen(true)}>
              <CreditCard className="size-4" />
              {t('page.suppliers.view.pay')}
            </Button>
          </PermissionGate>
        </div>
      </div>
    </>
  )
}
