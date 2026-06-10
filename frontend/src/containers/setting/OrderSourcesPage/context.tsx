import type { OrderSourceDTO } from '@remnant/shared'
import type { ReactNode } from 'react'
import type { Resolver, UseFormReturn } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import {
  useOrderSourceCreate,
  useOrderSourceEdit,
  useOrderSourceRemove,
} from '@/api/hooks'
import { useLocale } from '@/utils/hooks'

interface OrderSourceContextType {
  selectedOrderSource: OrderSourceDTO | undefined
  isModalOpen: boolean
  isLoading: boolean
  isEdit: boolean
  form: UseFormReturn<OrderSourceFormValues>
  openModal: (orderSource?: OrderSourceDTO) => void
  closeModal: () => void
  submitOrderSourceForm: (params: OrderSourceFormValues) => void
  removeOrderSource: (params: { ids: string[] }) => void
}

interface OrderSourceFormValues {
  names: Record<string, string>
  color: string
  priority: number
}

const OrderSourceContext = createContext<OrderSourceContextType | undefined>(undefined)

export function OrderSourceProvider({ children }: { children: ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedOrderSource, setSelectedOrderSource] = useState<OrderSourceDTO | undefined>(undefined)

  const { t } = useLocale()
  const formSchema = useMemo(() => createOrderSourceFormSchema(t), [t])

  const form = useForm<OrderSourceFormValues>({
    resolver: zodResolver(formSchema) as Resolver<OrderSourceFormValues>,
    defaultValues: getOrderSourceFormValues(),
  })

  const queryClient = useQueryClient()

  const closeModal = () => {
    if (!isModalOpen)
      return
    setIsModalOpen(false)
    setIsEdit(false)
    setSelectedOrderSource(undefined)
    form.reset()
  }

  const openModal = (orderSource?: OrderSourceDTO) => {
    setIsModalOpen(true)
    setIsEdit(!!orderSource)
    setSelectedOrderSource(orderSource)
    form.reset(getOrderSourceFormValues(orderSource))
  }

  const useMutateCreateOrderSource = useOrderSourceCreate({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        void queryClient.invalidateQueries({ queryKey: ['order-sources'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateEditOrderSource = useOrderSourceEdit({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        void queryClient.invalidateQueries({ queryKey: ['order-sources'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateRemoveOrderSource = useOrderSourceRemove({
    options: {
      onSuccess: ({ data }) => {
        void queryClient.invalidateQueries({ queryKey: ['order-sources'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const removeOrderSource = (params: { ids: string[] }) => {
    useMutateRemoveOrderSource.mutate(params)
  }

  const submitOrderSourceForm = (params: OrderSourceFormValues) => {
    if (!selectedOrderSource || !isEdit)
      return useMutateCreateOrderSource.mutate(params)

    return useMutateEditOrderSource.mutate({ ...params, id: selectedOrderSource.id })
  }

  const isLoading = useMutateCreateOrderSource.isPending || useMutateEditOrderSource.isPending || useMutateRemoveOrderSource.isPending

  const value: OrderSourceContextType = useMemo(
    () => ({
      selectedOrderSource,
      isModalOpen,
      isLoading,
      isEdit,
      form,
      openModal,
      closeModal,
      submitOrderSourceForm,
      removeOrderSource,
    }),
    [selectedOrderSource, isModalOpen, isLoading, isEdit, form],
  )

  return <OrderSourceContext.Provider value={value}>{children}</OrderSourceContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useOrderSourceContext(): OrderSourceContextType {
  const context = useContext(OrderSourceContext)
  if (!context) {
    throw new Error('useOrderSourceContext - OrderSourceContext')
  }
  return context
}

function createOrderSourceFormSchema(t: (key: string, options?: Record<string, unknown>) => string) {
  return z.object({
    names: z.record(z.string({ required_error: t('form.errors.required') }).min(3, { message: t('form.errors.min_length', { count: 3 }) }).trim()),
    color: z.string().optional(),
    priority: z.number().default(0),
  })
}

function getOrderSourceFormValues(orderSource?: OrderSourceDTO): OrderSourceFormValues {
  if (!orderSource) {
    return {
      names: {},
      color: '#ffffff',
      priority: 0,
    }
  }
  return {
    names: { ...orderSource.names },
    color: orderSource.color ?? '#ffffff',
    priority: orderSource.priority,
  }
}
