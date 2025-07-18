import type { ReactNode } from 'react'
import type { UseFormReturn } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'

import {
  useOrderCreate,
  useOrderEdit,
  useOrderRemove,
} from '@/api/hooks'
import { SUPPORTED_LANGUAGES } from '@/utils/constants'

interface OrderContextType {
  selectedOrder: Order
  isModalOpen: boolean
  isLoading: boolean
  isEdit: boolean
  form: UseFormReturn
  openModal: (order?: Order) => void
  closeModal: () => void
  submitOrderForm: (params) => void
  removeOrder: (params: { ids: string[] }) => void
}

const OrderContext = createContext<OrderContextType | undefined>(undefined)

interface OrderProviderProps {
  children: ReactNode
}

export function OrderProvider({ children }: OrderProviderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)

  const { t } = useTranslation()

  const defaultLanguageValues = SUPPORTED_LANGUAGES.reduce((acc, lang) => ({ ...acc, [lang]: '' }), {})

  const formSchema = useMemo(() =>
    z.object({
      names: z.record(z.string({ required_error: t('form.errors.required') }).min(3, { message: t('form.errors.min_length', { count: 3 }) }).trim()),
      color: z.string().optional(),
      priority: z.number().default(0),
      type: z.enum(['novaposhta', 'selfpickup']),
    }), [t])

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      names: defaultLanguageValues,
      color: '',
      priority: 0,
      type: 'novaposhta',
    },
  })

  const queryClient = useQueryClient()

  function getOrderFormValues(order) {
    if (!order) {
      return {
        names: defaultLanguageValues,
        color: '',
        priority: 0,
        type: 'novaposhta',
      }
    }
    return {
      names: { ...order.names },
      color: order.color,
      priority: order.priority,
      type: order.type,
    }
  }

  const closeModal = () => {
    if (!isModalOpen)
      return
    setIsModalOpen(false)
    setIsLoading(false)
    setIsEdit(false)
    setSelectedOrder(null)
    form.reset()
  }

  const openModal = (order) => {
    setIsModalOpen(true)
    setIsEdit(!!order)
    setSelectedOrder(order)
    form.reset(getOrderFormValues(order))
  }

  const useMutateCreateOrder = useOrderCreate({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        queryClient.invalidateQueries({ queryKey: ['orders'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateEditOrder = useOrderEdit({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        queryClient.invalidateQueries({ queryKey: ['orders'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateRemoveOrder = useOrderRemove({
    options: {
      onSuccess: ({ data }) => {
        queryClient.invalidateQueries({ queryKey: ['orders'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const removeOrder = (params) => {
    useMutateRemoveOrder.mutate(params)
  }

  const submitOrderForm = (params) => {
    setIsLoading(true)
    if (!selectedOrder)
      return useMutateCreateOrder.mutate(params)

    return useMutateEditOrder.mutate({ ...params, id: selectedOrder.id })
  }

  const value: OrderContextType = useMemo(
    () => ({
      selectedOrder,
      isModalOpen,
      isLoading,
      isEdit,
      form,
      openModal,
      closeModal,
      submitOrderForm,
      removeOrder,
    }),
    [selectedOrder, isModalOpen, isLoading, isEdit, form],
  )

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useOrderContext(): OrderContextType {
  const context = useContext(OrderContext)
  if (!context) {
    throw new Error('useOrderContext - OrderContext')
  }
  return context
}
