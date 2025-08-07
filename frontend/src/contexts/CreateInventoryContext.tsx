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
  useInventoryCreate,
} from '@/api/hooks'
import { useInventoryScanOptions } from '@/api/hooks/inventory/useInventoryScanOptions'

interface CreateInventoryContextType {
  isLoading: boolean
  form: UseFormReturn
  getBarcode: (params: { barcode: string, category: string }) => Promise<{ inventoryItems: any[], productIndex?: number }>
  submitInventoryForm: (params) => void
}

const CreateInventoryContext = createContext<CreateInventoryContextType | undefined>(undefined)

interface CreateInventoryProviderProps {
  children: ReactNode
}

export function CreateInventoryProvider({ children }: CreateInventoryProviderProps) {
  const [isLoading, setIsLoading] = useState(false)

  const { t } = useTranslation()
  const navigate = useNavigate()

  const formSchema = z.object({
    warehouse: z.string({ required_error: t('form.errors.required') }),
    category: z.string({ required_error: t('form.errors.required') }),
    comment: z.string().optional(),
    items: z.array(z.object({
      id: z.string({ required_error: t('form.errors.required') }),
      quantity: z.number({ required_error: t('form.errors.required') }),
      receivedQuantity: z.number().optional(),
    })).min(1, { message: t('form.errors.required.products') }),
  })

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      warehouse: '',
      category: '',
      comment: '',
      items: [],
    },
  })

  const queryClient = useQueryClient()

  const useMutateCreateInventory = useInventoryCreate({
    options: {
      onSuccess: ({ data }) => {
        queryClient.invalidateQueries({ queryKey: ['inventories'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
        navigate(`/inventories/`)
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const loadInventoryScanOptions = useInventoryScanOptions()

  const getBarcode = async ({ barcode, category }) => await loadInventoryScanOptions({ sorters: {}, filters: { barcode, category } })

  const submitInventoryForm = (params) => {
    setIsLoading(true)

    return useMutateCreateInventory.mutate({
      warehouse: params.warehouse,
      category: params.category,
      comment: params.comment,
      items: params.items,
    })
  }

  const value: CreateInventoryContextType = useMemo(
    () => ({
      isLoading,
      form,
      getBarcode,
      submitInventoryForm,
    }),
    [isLoading, form, getBarcode, submitInventoryForm],
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
