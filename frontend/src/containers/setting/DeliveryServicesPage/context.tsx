import type { DeliveryServiceDTO } from '@remnant/shared'
import type { ReactNode } from 'react'
import type { Resolver, UseFormReturn } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { DELIVERY_SERVICE_API_KEY_MASK } from '@remnant/shared'
import { useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { isValidPhoneNumber, parsePhoneNumber } from 'react-phone-number-input'
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

export interface DeliveryServiceFormValues {
  names: Record<string, string>
  color: string
  priority: number
  type: 'novaposhta' | 'selfpickup'
  active: boolean
  apiKey: string
  phone: string
  senderCityId: string
  senderCityName: string
  senderOfficeId: string
  senderOfficeName: string
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
    const payload = toDeliveryServiceRequest(params)

    if (!selectedDeliveryService || !isEdit)
      return useMutateCreateDeliveryService.mutate(payload)

    return useMutateEditDeliveryService.mutate({ ...payload, id: selectedDeliveryService.id })
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
    active: z.boolean(),
    apiKey: z.string().optional().default(''),
    phone: z.string().optional().default(''),
    senderCityId: z.string().optional().default(''),
    senderCityName: z.string().optional().default(''),
    senderOfficeId: z.string().optional().default(''),
    senderOfficeName: z.string().optional().default(''),
  }).superRefine((data, ctx) => {
    if (data.type !== 'novaposhta')
      return

    if (!data.apiKey?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('form.errors.required'), path: ['apiKey'] })
    }
    if (!data.phone?.trim() || !isValidPhoneNumber(data.phone)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('form.errors.invalid_phone'), path: ['phone'] })
    }
    if (!data.senderCityId?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('form.errors.required'), path: ['senderCityId'] })
    }
    if (!data.senderOfficeId?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('form.errors.required'), path: ['senderOfficeId'] })
    }
  })
}

function getDeliveryServiceFormValues(deliveryService?: DeliveryServiceDTO): DeliveryServiceFormValues {
  if (!deliveryService) {
    return {
      names: {},
      color: '#ffffff',
      priority: 0,
      type: 'novaposhta',
      active: true,
      apiKey: '',
      phone: '',
      senderCityId: '',
      senderCityName: '',
      senderOfficeId: '',
      senderOfficeName: '',
    }
  }

  const credentials = deliveryService.credentials?.type === 'novaposhta'
    ? deliveryService.credentials
    : undefined

  return {
    names: { ...deliveryService.names },
    color: deliveryService.color ?? '#ffffff',
    priority: deliveryService.priority,
    type: deliveryService.type,
    active: deliveryService.active ?? true,
    apiKey: credentials?.hasApiKey ? DELIVERY_SERVICE_API_KEY_MASK : '',
    phone: toE164Phone(credentials?.phone ?? ''),
    senderCityId: credentials?.sender.city.id ?? '',
    senderCityName: credentials?.sender.city.name ?? '',
    senderOfficeId: credentials?.sender.office.id ?? '',
    senderOfficeName: credentials?.sender.office.name ?? '',
  }
}

function toDeliveryServiceRequest(params: DeliveryServiceFormValues) {
  if (params.type === 'selfpickup') {
    return {
      names: params.names,
      color: params.color,
      priority: params.priority,
      type: params.type,
      active: params.active,
      credentials: { type: 'selfpickup' as const },
    }
  }

  return {
    names: params.names,
    color: params.color,
    priority: params.priority,
    type: params.type,
    active: params.active,
    credentials: {
      type: 'novaposhta' as const,
      apiKey: params.apiKey,
      // Nova Poshta expects digits like 380XXXXXXXXX
      phone: params.phone.replace(/\D/g, ''),
      sender: {
        city: { id: params.senderCityId, name: params.senderCityName },
        office: { id: params.senderOfficeId, name: params.senderOfficeName },
      },
    },
  }
}

function toE164Phone(phone: string): string {
  const raw = phone.trim()
  if (!raw)
    return ''

  const withPlus = raw.startsWith('+') ? raw : `+${raw.replace(/\D/g, '')}`
  const parsed = parsePhoneNumber(withPlus)
  return parsed?.number ?? withPlus
}
