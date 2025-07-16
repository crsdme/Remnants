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
  useDeliveryStatusCreate,
  useDeliveryStatusEdit,
  useDeliveryStatusRemove,
} from '@/api/hooks'
import { SUPPORTED_LANGUAGES } from '@/utils/constants'

interface DeliveryStatusContextType {
  selectedDeliveryStatus: DeliveryStatus
  isModalOpen: boolean
  isLoading: boolean
  isEdit: boolean
  form: UseFormReturn
  openModal: (deliveryStatus?: DeliveryStatus) => void
  closeModal: () => void
  submitDeliveryStatusForm: (params) => void
  removeDeliveryStatus: (params: { ids: string[] }) => void
}

const DeliveryStatusContext = createContext<DeliveryStatusContextType | undefined>(undefined)

interface DeliveryStatusProviderProps {
  children: ReactNode
}

export function DeliveryStatusProvider({ children }: DeliveryStatusProviderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedDeliveryStatus, setSelectedDeliveryStatus] = useState(null)

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

  function getDeliveryStatusFormValues(deliveryStatus) {
    if (!deliveryStatus) {
      return {
        names: defaultLanguageValues,
        color: '',
        priority: 0,
      }
    }
    return {
      names: { ...deliveryStatus.names },
      color: deliveryStatus.color,
      priority: deliveryStatus.priority,
    }
  }

  const closeModal = () => {
    if (!isModalOpen)
      return
    setIsModalOpen(false)
    setIsLoading(false)
    setIsEdit(false)
    setSelectedDeliveryStatus(null)
    form.reset()
  }

  const openModal = (deliveryStatus) => {
    setIsModalOpen(true)
    setIsEdit(!!deliveryStatus)
    setSelectedDeliveryStatus(deliveryStatus)
    form.reset(getDeliveryStatusFormValues(deliveryStatus))
  }

  const useMutateCreateDeliveryStatus = useDeliveryStatusCreate({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        queryClient.invalidateQueries({ queryKey: ['delivery-statuses'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateEditDeliveryStatus = useDeliveryStatusEdit({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        queryClient.invalidateQueries({ queryKey: ['delivery-statuses'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateRemoveDeliveryStatus = useDeliveryStatusRemove({
    options: {
      onSuccess: ({ data }) => {
        queryClient.invalidateQueries({ queryKey: ['delivery-statuses'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const removeDeliveryStatus = (params) => {
    useMutateRemoveDeliveryStatus.mutate(params)
  }

  const submitDeliveryStatusForm = (params) => {
    setIsLoading(true)
    if (!selectedDeliveryStatus)
      return useMutateCreateDeliveryStatus.mutate(params)

    return useMutateEditDeliveryStatus.mutate({ ...params, id: selectedDeliveryStatus.id })
  }

  const value: DeliveryStatusContextType = useMemo(
    () => ({
      selectedDeliveryStatus,
      isModalOpen,
      isLoading,
      isEdit,
      form,
      openModal,
      closeModal,
      submitDeliveryStatusForm,
      removeDeliveryStatus,
    }),
    [selectedDeliveryStatus, isModalOpen, isLoading, isEdit, form],
  )

  return <DeliveryStatusContext.Provider value={value}>{children}</DeliveryStatusContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDeliveryStatusContext(): DeliveryStatusContextType {
  const context = useContext(DeliveryStatusContext)
  if (!context) {
    throw new Error('useDeliveryStatusContext - DeliveryStatusContext')
  }
  return context
}
