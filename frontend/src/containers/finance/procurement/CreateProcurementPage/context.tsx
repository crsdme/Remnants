import type { ProcurementItemDTO } from '@remnant/shared'
import type { ReactNode } from 'react'
import type { Resolver, UseFormReturn } from 'react-hook-form'

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
import { useProcurementItemsOptions } from '@/api/hooks/procurement/useProcurementItemsOptions'

export interface CreateProcurementFormValues {
  comment?: string
  supplier: string
  items: {
    id: string
    quantity: number
    purchasePrice: number
    purchaseCurrency: { id: string }
  }[]
}

interface CreateProcurementContextType {
  isLoading: boolean
  form: UseFormReturn<CreateProcurementFormValues>
  getBarcode: (code: string) => Promise<ProcurementItemDTO[]>
  submitCreateProcurementForm: (params: CreateProcurementFormValues) => void
}

const CreateProcurementContext = createContext<CreateProcurementContextType | undefined>(undefined)

interface CreateProcurementProviderProps {
  children: ReactNode
}

export function CreateProcurementProvider({ children }: CreateProcurementProviderProps) {
  const [isLoading, setIsLoading] = useState(false)

  const { t } = useTranslation()
  const navigate = useNavigate()

  const formSchema = useMemo(() => createCreateProcurementFormSchema(t), [t])

  const form = useForm<CreateProcurementFormValues>({
    resolver: zodResolver(formSchema) as Resolver<CreateProcurementFormValues>,
    defaultValues: getCreateProcurementFormDefaults(),
  })

  const queryClient = useQueryClient()

  const useMutateCreateProcurement = useProcurementCreate({
    options: {
      onSuccess: ({ data }) => {
        void queryClient.invalidateQueries({ queryKey: ['procurements'] })
        void queryClient.invalidateQueries({ queryKey: ['products'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.message}` })
        setIsLoading(false)
        void navigate('/procurements')
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
        setIsLoading(false)
      },
    },
  })

  const submitCreateProcurementForm = (params: CreateProcurementFormValues) => {
    setIsLoading(true)
    return useMutateCreateProcurement.mutate({
      comment: params.comment,
      items: params.items,
      supplier: params.supplier,
    })
  }

  const loadProcurementItemsOptions = useProcurementItemsOptions()

  const getBarcode = async (code: string) => {
    const procurementItems = await loadProcurementItemsOptions({ selectedValue: [code] })
    return procurementItems
  }

  const value: CreateProcurementContextType = useMemo(
    () => ({
      isLoading,
      form,
      getBarcode,
      submitCreateProcurementForm,
    }),
    [isLoading, form, getBarcode, submitCreateProcurementForm],
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

function createCreateProcurementFormSchema(t: (key: string, options?: Record<string, unknown>) => string) {
  return z.object({
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
}

function getCreateProcurementFormDefaults(): CreateProcurementFormValues {
  return {
    comment: '',
    supplier: '',
    items: [],
  }
}
