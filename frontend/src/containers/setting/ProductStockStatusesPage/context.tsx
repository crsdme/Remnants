import type { ProductStockStatusCondition, ProductStockStatusDTO } from '@remnant/shared'
import type { ReactNode } from 'react'
import type { Resolver, UseFormReturn } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'

import {
  useProductStockStatusCreate,
  useProductStockStatusEdit,
  useProductStockStatusRemove,
} from '@/api/hooks'

interface ProductStockStatusContextType {
  selectedProductStockStatus: ProductStockStatusDTO | undefined
  isModalOpen: boolean
  isLoading: boolean
  isEdit: boolean
  form: UseFormReturn<ProductStockStatusFormValues>
  openModal: (status?: ProductStockStatusDTO) => void
  closeModal: () => void
  submitProductStockStatusForm: (params: ProductStockStatusFormValues) => void
  removeProductStockStatus: (params: { ids: string[] }) => void
}

const ProductStockStatusContext = createContext<ProductStockStatusContextType | undefined>(undefined)

export interface ProductStockStatusFormValues {
  names: Record<string, string>
  color: string
  priority: number
  active: boolean
  isDefault: boolean
  conditions: ProductStockStatusCondition[]
}

export function ProductStockStatusProvider({ children }: { children: ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedProductStockStatus, setSelectedProductStockStatus] = useState<ProductStockStatusDTO | undefined>(undefined)

  const { t } = useTranslation()

  const formSchema = useMemo(() => createProductStockStatusFormSchema(t), [t])

  const form = useForm<ProductStockStatusFormValues>({
    resolver: zodResolver(formSchema) as Resolver<ProductStockStatusFormValues>,
    defaultValues: getProductStockStatusFormValues(),
  })

  const queryClient = useQueryClient()

  const closeModal = () => {
    if (!isModalOpen)
      return
    setIsModalOpen(false)
    setIsEdit(false)
    setSelectedProductStockStatus(undefined)
    form.reset()
  }

  const openModal = (status?: ProductStockStatusDTO) => {
    setIsModalOpen(true)
    setIsEdit(!!status)
    setSelectedProductStockStatus(status)
    form.reset(getProductStockStatusFormValues(status))
  }

  const useMutateCreate = useProductStockStatusCreate({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        void queryClient.invalidateQueries({ queryKey: ['product-stock-statuses'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateEdit = useProductStockStatusEdit({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        void queryClient.invalidateQueries({ queryKey: ['product-stock-statuses'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateRemove = useProductStockStatusRemove({
    options: {
      onSuccess: ({ data }) => {
        void queryClient.invalidateQueries({ queryKey: ['product-stock-statuses'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const removeProductStockStatus = (params: { ids: string[] }) => {
    useMutateRemove.mutate(params)
  }

  const submitProductStockStatusForm = (params: ProductStockStatusFormValues) => {
    if (!selectedProductStockStatus || !isEdit)
      return useMutateCreate.mutate(params)

    return useMutateEdit.mutate({ ...params, id: selectedProductStockStatus.id })
  }

  const isLoading = useMutateCreate.isPending || useMutateEdit.isPending || useMutateRemove.isPending

  const value: ProductStockStatusContextType = useMemo(
    () => ({
      selectedProductStockStatus,
      isModalOpen,
      isLoading,
      isEdit,
      form,
      openModal,
      closeModal,
      submitProductStockStatusForm,
      removeProductStockStatus,
    }),
    [selectedProductStockStatus, isModalOpen, isLoading, isEdit, form],
  )

  return <ProductStockStatusContext.Provider value={value}>{children}</ProductStockStatusContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProductStockStatusContext(): ProductStockStatusContextType {
  const context = useContext(ProductStockStatusContext)
  if (!context) {
    throw new Error('useProductStockStatusContext - ProductStockStatusContext')
  }
  return context
}

function createProductStockStatusFormSchema(t: (key: string, options?: Record<string, unknown>) => string) {
  return z.object({
    names: z.record(z.string({ required_error: t('form.errors.required') }).min(2, { message: t('form.errors.min_length', { count: 2 }) }).trim()),
    color: z.string().optional(),
    priority: z.number().default(0),
    active: z.boolean().default(true),
    isDefault: z.boolean().default(false),
    conditions: z.array(z.object({
      field: z.enum(['qty', 'daysSinceLastSale', 'daysSinceQtyChange']),
      operator: z.enum(['eq', 'neq', 'lt', 'lte', 'gt', 'gte']),
      value: z.number(),
    })).default([]),
  })
}

function getProductStockStatusFormValues(status?: ProductStockStatusDTO): ProductStockStatusFormValues {
  if (!status) {
    return {
      names: {},
      color: '#22c55e',
      priority: 0,
      active: true,
      isDefault: false,
      conditions: [],
    }
  }
  return {
    names: { ...status.names },
    color: status.color ?? '#22c55e',
    priority: status.priority,
    active: status.active ?? true,
    isDefault: status.isDefault ?? false,
    conditions: status.conditions?.map(c => ({ ...c })) ?? [],
  }
}
