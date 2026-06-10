import type { DeliveryServiceDTO } from '@remnant/shared'
import type { ReactNode } from 'react'
import type { Resolver, UseFormReturn } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import {
  useDeliveryServiceCreate,
  useDeliveryServiceEdit,
  useDeliveryServiceRemove,
} from '@/api/hooks'
import { useLocale } from '@/utils/hooks'

interface DeliveryServiceContextType {
  selectedDeliveryService: DeliveryServiceDTO | undefined
  isModalOpen: boolean
  isLoading: boolean
  isEdit: boolean
  form: UseFormReturn<DeliveryServiceFormValues>
  openModal: (deliveryService?: DeliveryServiceDTO) => void
  closeModal: () => void
  submitDeliveryServiceForm: (params: DeliveryServiceFormValues) => void
  removeDeliveryService: (params: { ids: string[] }) => void
}

const DeliveryServiceContext = createContext<DeliveryServiceContextType | undefined>(undefined)

interface DeliveryServiceFormValues {
  names: Record<string, string>
  color: string
  priority: number
  type: 'novaposhta' | 'selfpickup'
}

export function DeliveryServiceProvider({ children }: { children: ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedDeliveryService, setSelectedDeliveryService] = useState<DeliveryServiceDTO | undefined>(undefined)
  const { t } = useLocale()

  const formSchema = useMemo(() => createDeliveryServiceFormSchema(t), [t])

  const form = useForm<DeliveryServiceFormValues>({
    resolver: zodResolver(formSchema) as Resolver<DeliveryServiceFormValues>,
    defaultValues: getDeliveryServiceFormValues(),
  })

  const queryClient = useQueryClient()

  const closeModal = () => {
    if (!isModalOpen)
      return
    setIsModalOpen(false)
    setIsEdit(false)
    setSelectedDeliveryService(undefined)
    form.reset()
  }

  const openModal = (deliveryService?: DeliveryServiceDTO) => {
    setIsModalOpen(true)
    setIsEdit(!!deliveryService)
    setSelectedDeliveryService(deliveryService)
    form.reset(getDeliveryServiceFormValues(deliveryService))
  }

  const useMutateCreateDeliveryService = useDeliveryServiceCreate({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        void queryClient.invalidateQueries({ queryKey: ['delivery-services'] })
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
        void queryClient.invalidateQueries({ queryKey: ['delivery-services'] })
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
        void queryClient.invalidateQueries({ queryKey: ['delivery-services'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const removeDeliveryService = (params: { ids: string[] }) => {
    useMutateRemoveDeliveryService.mutate(params)
  }

  const submitDeliveryServiceForm = (params: DeliveryServiceFormValues) => {
    if (!selectedDeliveryService || !isEdit)
      return useMutateCreateDeliveryService.mutate(params)

    return useMutateEditDeliveryService.mutate({ ...params, id: selectedDeliveryService.id })
  }

  const isLoading = useMutateCreateDeliveryService.isPending || useMutateEditDeliveryService.isPending || useMutateRemoveDeliveryService.isPending

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

function createDeliveryServiceFormSchema(t: (key: string, options?: Record<string, unknown>) => string) {
  return z.object({
    names: z.record(z.string({ required_error: t('form.errors.required') }).min(3, { message: t('form.errors.min_length', { count: 3 }) }).trim()),
    color: z.string().optional(),
    priority: z.number().default(0),
    type: z.enum(['novaposhta', 'selfpickup']),
  })
}

function getDeliveryServiceFormValues(deliveryService?: DeliveryServiceDTO): DeliveryServiceFormValues {
  if (!deliveryService) {
    return {
      names: {},
      color: '#ffffff',
      priority: 0,
      type: 'novaposhta',
    }
  }
  return {
    names: { ...deliveryService.names },
    color: deliveryService.color ?? '#ffffff',
    priority: deliveryService.priority,
    type: deliveryService.type,
  }
}
