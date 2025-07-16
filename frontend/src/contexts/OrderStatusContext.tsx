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
  useOrderStatusCreate,
  useOrderStatusEdit,
  useOrderStatusRemove,
} from '@/api/hooks'
import { SUPPORTED_LANGUAGES } from '@/utils/constants'

interface OrderStatusContextType {
  selectedOrderStatus: OrderStatus
  isModalOpen: boolean
  isLoading: boolean
  isEdit: boolean
  form: UseFormReturn
  openModal: (orderStatus?: OrderStatus) => void
  closeModal: () => void
  submitOrderStatusForm: (params) => void
  removeOrderStatus: (params: { ids: string[] }) => void
}

const OrderStatusContext = createContext<OrderStatusContextType | undefined>(undefined)

interface OrderStatusProviderProps {
  children: ReactNode
}

export function OrderStatusProvider({ children }: OrderStatusProviderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedOrderStatus, setSelectedOrderStatus] = useState(null)

  const { t } = useTranslation()

  const defaultLanguageValues = SUPPORTED_LANGUAGES.reduce((acc, lang) => ({ ...acc, [lang]: '' }), {})

  const formSchema = useMemo(() =>
    z.object({
      names: z.record(z.string({ required_error: t('form.errors.required') }).min(3, { message: t('form.errors.min_length', { count: 3 }) }).trim()),
      color: z.string().optional(),
      priority: z.number().default(0),
    }), [t])

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      names: defaultLanguageValues,
      color: '',
      priority: 0,
    },
  })

  const queryClient = useQueryClient()

  function getOrderStatusFormValues(orderStatus) {
    if (!orderStatus) {
      return {
        names: defaultLanguageValues,
        color: '',
        priority: 0,
      }
    }
    return {
      names: { ...orderStatus.names },
      color: orderStatus.color,
      priority: orderStatus.priority,
    }
  }

  const closeModal = () => {
    if (!isModalOpen)
      return
    setIsModalOpen(false)
    setIsLoading(false)
    setIsEdit(false)
    setSelectedOrderStatus(null)
    form.reset()
  }

  const openModal = (orderStatus) => {
    setIsModalOpen(true)
    setIsEdit(!!orderStatus)
    setSelectedOrderStatus(orderStatus)
    form.reset(getOrderStatusFormValues(orderStatus))
  }

  const useMutateCreateOrderStatus = useOrderStatusCreate({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        queryClient.invalidateQueries({ queryKey: ['order-statuses'] })
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
        queryClient.invalidateQueries({ queryKey: ['order-statuses'] })
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
        queryClient.invalidateQueries({ queryKey: ['order-statuses'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const removeOrderStatus = (params) => {
    useMutateRemoveOrderStatus.mutate(params)
  }

  const submitOrderStatusForm = (params) => {
    setIsLoading(true)
    if (!selectedOrderStatus)
      return useMutateCreateOrderStatus.mutate(params)

    return useMutateEditOrderStatus.mutate({ ...params, id: selectedOrderStatus.id })
  }

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
