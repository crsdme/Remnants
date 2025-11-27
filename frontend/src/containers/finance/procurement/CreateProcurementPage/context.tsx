import type { ReactNode } from 'react'
import type { UseFormReturn } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { toast } from 'sonner'
import { z } from 'zod'
import {
  useProcurementCreate,
} from '@/api/hooks'
import { useProcurementItemsOptions } from '@/api/hooks/'

interface CreateProcurementContextType {
  isLoading: boolean
  form: UseFormReturn
  getBarcode: (code: string) => Promise<ProcurementItem[]>
  onError: (formErrors) => void
  submitCreateProcurementForm: (params) => void
}

const CreateProcurementContext = createContext<CreateProcurementContextType | undefined>(undefined)

interface CreateProcurementProviderProps {
  children: ReactNode
}

export function CreateProcurementProvider({ children }: CreateProcurementProviderProps) {
  const [isLoading, setIsLoading] = useState(false)

  const { t } = useTranslation()
  const navigate = useNavigate()

  const formSchema = z.object({
    comment: z.string().optional(),
    supplier: z.string({ required_error: t('form.errors.required') }).min(1, { message: t('form.errors.required') }),
    items: z.array(z.object({
      id: z.string({ required_error: t('form.errors.required') }),
      quantity: z.number({ required_error: t('form.errors.required') }),
      purchasePrice: z.number({ required_error: t('form.errors.required') }),
      purchaseCurrency: z.object({
        id: z.string({ required_error: t('form.errors.required') }),
      }),
    })).min(1, { message: t('form.errors.required.products') }),
  })

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      comment: '',
      supplier: '',
      items: [],
    },
  })

  const queryClient = useQueryClient()

  const useMutateCreateProcurement = useProcurementCreate({
    options: {
      onSuccess: ({ data }) => {
        queryClient.invalidateQueries({ queryKey: ['procurements'] })
        queryClient.invalidateQueries({ queryKey: ['products'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
        setIsLoading(false)
        navigate('/procurements')
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
        setIsLoading(false)
      },
    },
  })

  const submitCreateProcurementForm = (params) => {
    setIsLoading(true)
    return useMutateCreateProcurement.mutate({
      createdBy: params.createdBy,
      comment: params.comment,
      items: params.items,
      supplier: params.supplier,
      status: params.status,
      warehouse: params.warehouse,
      expenses: params.expenses,
      payments: params.payments,
    })
  }

  const loadProcurementItemsOptions = useProcurementItemsOptions()
  const getBarcode = async (code: string) => {
    const procurementItems = await loadProcurementItemsOptions({ selectedValue: [code] })
    return procurementItems
  }

  const onError = (formErrors) => {
    if (formErrors.products) {
      toast.error(formErrors.products.message)
    }
  }

  const value: CreateProcurementContextType = useMemo(
    () => ({
      isLoading,
      form,
      getBarcode,
      onError,
      submitCreateProcurementForm,
    }),
    [isLoading, form],
  )

  return <CreateProcurementContext.Provider value={value}>{children}</CreateProcurementContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCreateProcurementContext(): CreateProcurementContextType {
  const context = useContext(CreateProcurementContext)
  if (!context) {
    throw new Error('useCreateProcurementContext - CreateProcurementContext')
  }
  return context
}
