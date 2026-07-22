import type { ReactNode } from 'react'
import type { FieldErrors, Resolver, UseFormReturn } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'

import { useInventoryCreate } from '@/api/hooks'
import { useInventoryScanOptions } from '@/api/hooks/inventory/useInventoryScanOptions'
import { useLocale } from '@/utils/hooks'

type LoadInventoryScanOptionsFn = ReturnType<typeof useInventoryScanOptions>

export interface CreateInventoryFormValues {
  warehouse: string
  categories: string[]
  comment?: string
  items: {
    id: string
    lineQuantity: number
    receivedQuantity?: number
  }[]
}

interface CreateInventoryContextType {
  isLoading: boolean
  form: UseFormReturn<CreateInventoryFormValues>
  getBarcode: (params: { barcode: string, category: string }) => ReturnType<LoadInventoryScanOptionsFn>
  onError: (formErrors: FieldErrors<CreateInventoryFormValues>) => void
  submitInventoryForm: (params: CreateInventoryFormValues) => void
}

const CreateInventoryContext = createContext<CreateInventoryContextType | undefined>(undefined)

export function CreateInventoryProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)

  const { t } = useLocale()
  const navigate = useNavigate()

  const formSchema = useMemo(() => createCreateInventoryFormSchema(t), [t])

  const form = useForm<CreateInventoryFormValues>({
    resolver: zodResolver(formSchema) as Resolver<CreateInventoryFormValues>,
    defaultValues: getCreateInventoryFormDefaults(),
  })

  const queryClient = useQueryClient()

  const useMutateCreateInventory = useInventoryCreate({
    options: {
      onSuccess: ({ data }) => {
        setIsLoading(false)
        void queryClient.invalidateQueries({ queryKey: ['inventories'] })
        void queryClient.invalidateQueries({ queryKey: ['products'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data?.message || ''}` })
        void navigate('/inventories')
      },
      onError: ({ response }) => {
        setIsLoading(false)
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const loadInventoryScanOptions = useInventoryScanOptions()

  const getBarcode = async ({ barcode, category }: { barcode: string, category: string }) =>
    loadInventoryScanOptions({ sorters: {}, filters: { barcode, category } })

  const submitInventoryForm = (params: CreateInventoryFormValues) => {
    setIsLoading(true)

    useMutateCreateInventory.mutate({
      warehouse: params.warehouse,
      categories: params.categories,
      comment: params.comment,
      items: params.items.map(item => ({
        id: item.id,
        quantity: item.lineQuantity,
        receivedQuantity: item.receivedQuantity ?? 0,
      })),
    })
  }

  const onError = (formErrors: FieldErrors<CreateInventoryFormValues>) => {
    if (formErrors.items) {
      toast.error(String(formErrors.items.message ?? ''))
    }
  }

  const value: CreateInventoryContextType = useMemo(
    () => ({
      isLoading,
      form,
      getBarcode,
      onError,
      submitInventoryForm,
    }),
    [isLoading, form, getBarcode, onError, submitInventoryForm],
  )

  return <CreateInventoryContext.Provider value={value}>{children}</CreateInventoryContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCreateInventoryContext(): CreateInventoryContextType {
  const context = useContext(CreateInventoryContext)
  if (!context) {
    throw new Error('useCreateInventoryContext - CreateInventoryContext')
  }
  return context
}

function createCreateInventoryFormSchema(t: (key: string, options?: Record<string, unknown>) => string) {
  return z.object({
    warehouse: z.string({ required_error: t('form.errors.required') }),
    categories: z.array(z.string()).min(1, { message: t('form.errors.required') }),
    comment: z.string().optional(),
    items: z.array(z.object({
      id: z.string({ required_error: t('form.errors.required') }),
      lineQuantity: z.number({ required_error: t('form.errors.required') }),
      receivedQuantity: z.number().optional(),
    })),
  })
}

function getCreateInventoryFormDefaults(): CreateInventoryFormValues {
  return {
    warehouse: '',
    categories: [],
    comment: '',
    items: [],
  }
}
