import type { ProcurementDTO } from '@remnant/shared'
import type { ReactNode } from 'react'
import type { UseFormReturn } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import { toast } from 'sonner'
import { z } from 'zod'
import {
  useProcurementQuery,
} from '@/api/hooks'
import { useProcurementPay } from '@/api/hooks/procurement/useProcurementPay'

interface PayProcurementContextType {
  procurement?: ProcurementDTO
  isLoading: boolean
  form: UseFormReturn<{ cashregister: string, account: string, currency: string, amount: number, description?: string }>
  submitPayProcurementForm: (params: { cashregister: string, account: string, currency: string, amount: number, description?: string }) => void
}

const PayProcurementContext = createContext<PayProcurementContextType | undefined>(undefined)

export function PayProcurementProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const { procurementSeq } = useParams()

  const { t } = useTranslation()

  const formSchema = z.object({
    cashregister: z.string({ required_error: t('form.errors.required') }).min(1, t('form.errors.required')),
    account: z.string({ required_error: t('form.errors.required') }).min(1, t('form.errors.required')),
    currency: z.string({ required_error: t('form.errors.required') }).min(1, t('form.errors.required')),
    amount: z.number({ required_error: t('form.errors.required') }).min(1, t('form.errors.required')),
    description: z.string().optional(),
  })

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cashregister: '',
      account: '',
      currency: '',
      amount: 0,
      description: '',
    },
  })

  const queryClient = useQueryClient()

  const { procurements: [procurement] } = useProcurementQuery(
    { filters: { seq: [procurementSeq] } },
  )

  const useMutatePayProcurement = useProcurementPay({
    options: {
      onSuccess: ({ data }) => {
        void queryClient.invalidateQueries({ queryKey: ['procurements'] })
        void queryClient.invalidateQueries({ queryKey: ['products'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.message}` })
      },
      onError: ({ response }) => {
        setIsLoading(false)
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const submitPayProcurementForm = (params: { cashregister: string, account: string, currency: string, amount: number, description?: string }) => {
    setIsLoading(true)

    return useMutatePayProcurement.mutate({
      id: procurement.id,
      procurementId: procurement.id,
      cashregister: params.cashregister,
      account: params.account,
      currency: params.currency,
      amount: params.amount,
      comment: params.description,
    })
  }

  const value: PayProcurementContextType = useMemo(
    () => ({
      procurement,
      isLoading,
      form,
      submitPayProcurementForm,
    }),
    [procurement, isLoading, form],
  )

  return <PayProcurementContext.Provider value={value}>{children}</PayProcurementContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePayProcurementContext(): PayProcurementContextType {
  const context = useContext(PayProcurementContext)
  if (!context) {
    throw new Error('usePayProcurementContext - PayProcurementContext')
  }
  return context
}
