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
  useDeliveryServiceCreate,
  useDeliveryServiceEdit,
  useDeliveryServiceRemove,
} from '@/api/hooks'
import { SUPPORTED_LANGUAGES } from '@/utils/constants'

interface DeliveryServiceContextType {
  selectedDeliveryService: DeliveryService
  isModalOpen: boolean
  isLoading: boolean
  isEdit: boolean
  form: UseFormReturn
  openModal: (deliveryService?: DeliveryService) => void
  closeModal: () => void
  submitDeliveryServiceForm: (params) => void
  removeDeliveryService: (params: { ids: string[] }) => void
}

const DeliveryServiceContext = createContext<DeliveryServiceContextType | undefined>(undefined)

interface DeliveryServiceProviderProps {
  children: ReactNode
}

export function DeliveryServiceProvider({ children }: DeliveryServiceProviderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedDeliveryService, setSelectedDeliveryService] = useState(null)

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

  function getDeliveryServiceFormValues(deliveryService) {
    if (!deliveryService) {
      return {
        names: defaultLanguageValues,
        color: '',
        priority: 0,
        type: 'novaposhta',
      }
    }
    return {
      names: { ...deliveryService.names },
      color: deliveryService.color,
      priority: deliveryService.priority,
      type: deliveryService.type,
    }
  }

  const closeModal = () => {
    if (!isModalOpen)
      return
    setIsModalOpen(false)
    setIsLoading(false)
    setIsEdit(false)
    setSelectedDeliveryService(null)
    form.reset()
  }

  const openModal = (deliveryService) => {
    setIsModalOpen(true)
    setIsEdit(!!deliveryService)
    setSelectedDeliveryService(deliveryService)
    form.reset(getDeliveryServiceFormValues(deliveryService))
  }

  const useMutateCreateDeliveryService = useDeliveryServiceCreate({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        queryClient.invalidateQueries({ queryKey: ['delivery-services'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateEditDeliveryService = useDeliveryServiceEdit({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        queryClient.invalidateQueries({ queryKey: ['delivery-services'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateRemoveDeliveryService = useDeliveryServiceRemove({
    options: {
      onSuccess: ({ data }) => {
        queryClient.invalidateQueries({ queryKey: ['delivery-services'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const removeDeliveryService = (params) => {
    useMutateRemoveDeliveryService.mutate(params)
  }

  const submitDeliveryServiceForm = (params) => {
    setIsLoading(true)
    if (!selectedDeliveryService)
      return useMutateCreateDeliveryService.mutate(params)

    return useMutateEditDeliveryService.mutate({ ...params, id: selectedDeliveryService.id })
  }

  const value: DeliveryServiceContextType = useMemo(
    () => ({
      selectedDeliveryService,
      isModalOpen,
      isLoading,
      isEdit,
      form,
      openModal,
      closeModal,
      submitDeliveryServiceForm,
      removeDeliveryService,
    }),
    [selectedDeliveryService, isModalOpen, isLoading, isEdit, form],
  )

  return <DeliveryServiceContext.Provider value={value}>{children}</DeliveryServiceContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDeliveryServiceContext(): DeliveryServiceContextType {
  const context = useContext(DeliveryServiceContext)
  if (!context) {
    throw new Error('useDeliveryServiceContext - DeliveryServiceContext')
  }
  return context
}
