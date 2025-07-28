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
  useOrderSourceCreate,
  useOrderSourceEdit,
  useOrderSourceRemove,
} from '@/api/hooks'
import { SUPPORTED_LANGUAGES } from '@/utils/constants'

interface OrderSourceContextType {
  selectedOrderSource: OrderSource
  isModalOpen: boolean
  isLoading: boolean
  isEdit: boolean
  form: UseFormReturn
  openModal: (orderSource?: OrderSource) => void
  closeModal: () => void
  submitOrderSourceForm: (params) => void
  removeOrderSource: (params: { ids: string[] }) => void
}

const OrderSourceContext = createContext<OrderSourceContextType | undefined>(undefined)

interface OrderSourceProviderProps {
  children: ReactNode
}

export function OrderSourceProvider({ children }: OrderSourceProviderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedOrderSource, setSelectedOrderSource] = useState(null)

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

  function getOrderSourceFormValues(orderSource) {
    if (!orderSource) {
      return {
        names: defaultLanguageValues,
        color: '',
        priority: 0,
      }
    }
    return {
      names: { ...orderSource.names },
      color: orderSource.color,
      priority: orderSource.priority,
    }
  }

  const closeModal = () => {
    if (!isModalOpen)
      return
    setIsModalOpen(false)
    setIsLoading(false)
    setIsEdit(false)
    setSelectedOrderSource(null)
    form.reset()
  }

  const openModal = (orderSource) => {
    setIsModalOpen(true)
    setIsEdit(!!orderSource)
    setSelectedOrderSource(orderSource)
    form.reset(getOrderSourceFormValues(orderSource))
  }

  const useMutateCreateOrderSource = useOrderSourceCreate({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        queryClient.invalidateQueries({ queryKey: ['order-sources'] })
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
        queryClient.invalidateQueries({ queryKey: ['order-sources'] })
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
        queryClient.invalidateQueries({ queryKey: ['order-sources'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const removeOrderSource = (params) => {
    useMutateRemoveOrderSource.mutate(params)
  }

  const submitOrderSourceForm = (params) => {
    setIsLoading(true)
    if (!selectedOrderSource)
      return useMutateCreateOrderSource.mutate(params)

    return useMutateEditOrderSource.mutate({ ...params, id: selectedOrderSource.id })
  }

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
