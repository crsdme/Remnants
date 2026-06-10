import type { OrderStatusDTO } from '@remnant/shared'
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
  useOrderStatusCreate,
  useOrderStatusEdit,
  useOrderStatusRemove,
} from '@/api/hooks'

interface OrderStatusContextType {
  selectedOrderStatus: OrderStatusDTO | undefined
  isModalOpen: boolean
  isLoading: boolean
  isEdit: boolean
  form: UseFormReturn<OrderStatusFormValues>
  openModal: (orderStatus?: OrderStatusDTO) => void
  closeModal: () => void
  submitOrderStatusForm: (params: OrderStatusFormValues) => void
  removeOrderStatus: (params: { ids: string[] }) => void
}

const OrderStatusContext = createContext<OrderStatusContextType | undefined>(undefined)

interface OrderStatusFormValues {
  names: Record<string, string>
  color: string
  priority: number
  isLocked: boolean
  isSelectable: boolean
}

export function OrderStatusProvider({ children }: { children: ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedOrderStatus, setSelectedOrderStatus] = useState<OrderStatusDTO | undefined>(undefined)

  const { t } = useTranslation()

  const formSchema = useMemo(() => createOrderStatusFormSchema(t), [t])

  const form = useForm<OrderStatusFormValues>({
    resolver: zodResolver(formSchema) as Resolver<OrderStatusFormValues>,
    defaultValues: getOrderStatusFormValues(),
  })

  const queryClient = useQueryClient()

  const closeModal = () => {
    if (!isModalOpen)
      return
    setIsModalOpen(false)
    setIsEdit(false)
    setSelectedOrderStatus(undefined)
    form.reset()
  }

  const openModal = (orderStatus?: OrderStatusDTO) => {
    setIsModalOpen(true)
    setIsEdit(!!orderStatus)
    setSelectedOrderStatus(orderStatus)
    form.reset(getOrderStatusFormValues(orderStatus))
  }

  const useMutateCreateOrderStatus = useOrderStatusCreate({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        void queryClient.invalidateQueries({ queryKey: ['order-statuses'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateEditOrderStatus = useOrderStatusEdit({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        void queryClient.invalidateQueries({ queryKey: ['order-statuses'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateRemoveOrderStatus = useOrderStatusRemove({
    options: {
      onSuccess: ({ data }) => {
        void queryClient.invalidateQueries({ queryKey: ['order-statuses'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const removeOrderStatus = (params: { ids: string[] }) => {
    useMutateRemoveOrderStatus.mutate(params)
  }

  const submitOrderStatusForm = (params: OrderStatusFormValues) => {
    if (!selectedOrderStatus || !isEdit)
      return useMutateCreateOrderStatus.mutate(params)

    return useMutateEditOrderStatus.mutate({ ...params, id: selectedOrderStatus.id })
  }

  const isLoading = useMutateCreateOrderStatus.isPending || useMutateEditOrderStatus.isPending || useMutateRemoveOrderStatus.isPending

  const value: OrderStatusContextType = useMemo(
    () => ({
      selectedOrderStatus,
      isModalOpen,
      isLoading,
      isEdit,
      form,
      openModal,
      closeModal,
      submitOrderStatusForm,
      removeOrderStatus,
    }),
    [selectedOrderStatus, isModalOpen, isLoading, isEdit, form],
  )

  return <OrderStatusContext.Provider value={value}>{children}</OrderStatusContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useOrderStatusContext(): OrderStatusContextType {
  const context = useContext(OrderStatusContext)
  if (!context) {
    throw new Error('useOrderStatusContext - OrderStatusContext')
  }
  return context
}

function createOrderStatusFormSchema(t: (key: string, options?: Record<string, unknown>) => string) {
  return z.object({
    names: z.record(z.string({ required_error: t('form.errors.required') }).min(3, { message: t('form.errors.min_length', { count: 3 }) }).trim()),
    color: z.string().optional(),
    priority: z.number().default(0),
    isLocked: z.boolean().default(false),
    isSelectable: z.boolean().default(false),
  })
}

function getOrderStatusFormValues(orderStatus?: OrderStatusDTO): OrderStatusFormValues {
  if (!orderStatus) {
    return {
      names: {},
      color: '#ffffff',
      priority: 0,
      isLocked: false,
      isSelectable: false,
    }
  }
  return {
    names: { ...orderStatus.names },
    color: orderStatus.color ?? '#ffffff',
    priority: orderStatus.priority,
    isLocked: orderStatus.isLocked,
    isSelectable: orderStatus.isSelectable,
  }
}
