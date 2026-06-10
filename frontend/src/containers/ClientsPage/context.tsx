import type { ClientDTO } from '@remnant/shared'
import type { ReactNode } from 'react'
import type { Resolver, UseFormReturn } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import {
  useClientCreate,
  useClientEdit,
  useClientRemove,
} from '@/api/hooks'
import { useLocale } from '@/utils/hooks'

interface ClientContextType {
  selectedClient: ClientDTO | undefined
  isModalOpen: boolean
  isLoading: boolean
  isEdit: boolean
  form: UseFormReturn<ClientFormValues>
  openModal: (client?: ClientDTO) => void
  closeModal: () => void
  submitClientForm: (params: ClientFormValues) => void
  removeClient: (params: { ids: string[] }) => void
}

export interface ClientFormValues {
  name: string
  middleName: string
  lastName: string
  country: string
  phones: { value: string }[]
  emails: { value: string }[]
  socials: { type: string, value: string }[]
  comment: string
}

function getClientFormValues(client?: ClientDTO): ClientFormValues {
  if (!client) {
    return {
      name: '',
      middleName: '',
      lastName: '',
      country: '',
      phones: [],
      emails: [],
      socials: [],
      comment: '',
    }
  }
  return {
    name: client.name,
    middleName: client.middleName ?? '',
    lastName: client.lastName ?? '',
    country: client.country ?? '',
    phones: client.phones?.map(phone => ({ value: phone })) ?? [],
    emails: client.emails?.map(email => ({ value: email })) ?? [],
    socials: client.socials ?? [],
    comment: client.comment ?? '',
  }
}

const ClientContext = createContext<ClientContextType | undefined>(undefined)

export function ClientProvider({ children }: { children: ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedClient, setSelectedClient] = useState<ClientDTO | undefined>(undefined)

  const { t } = useLocale()

  const formSchema = useMemo(() =>
    z.object({
      name: z.string({ required_error: t('form.errors.required') }).min(3, { message: t('form.errors.min_length', { count: 3 }) }).trim(),
      middleName: z.string().optional(),
      lastName: z.string().optional(),
      country: z.string().optional(),
      phones: z.array(z.object({ value: z.string().min(10, { message: t('form.errors.min_length', { count: 10 }) }) })).optional(),
      emails: z.array(z.object({ value: z.string().email() })).optional(),
      socials: z.array(z.object({
        type: z.string(),
        value: z.string(),
      })).optional(),
      comment: z.string().optional(),
    }), [t])

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(formSchema) as Resolver<ClientFormValues>,
    defaultValues: getClientFormValues(),
  })

  const queryClient = useQueryClient()

  const closeModal = () => {
    if (!isModalOpen)
      return
    setIsModalOpen(false)
    setIsEdit(false)
    setSelectedClient(undefined)
    form.reset()
  }

  const openModal = (client?: ClientDTO) => {
    setIsModalOpen(true)
    setIsEdit(!!client)
    setSelectedClient(client)
    form.reset(getClientFormValues(client))
  }

  const useMutateCreateClient = useClientCreate({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        void queryClient.invalidateQueries({ queryKey: ['clients'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateEditClient = useClientEdit({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        void queryClient.invalidateQueries({ queryKey: ['clients'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateRemoveClient = useClientRemove({
    options: {
      onSuccess: ({ data }) => {
        void queryClient.invalidateQueries({ queryKey: ['clients'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const removeClient = (params: { ids: string[] }) => {
    useMutateRemoveClient.mutate(params)
  }

  const submitClientForm = (params: ClientFormValues) => {
    params.phones = params.phones?.map(phone => ({ value: phone.value }))
    params.emails = params.emails?.map(email => ({ value: email.value }))

    if (!selectedClient) {
      return useMutateCreateClient.mutate({
        name: params.name,
        middleName: params.middleName,
        lastName: params.lastName,
        country: params.country,
        phones: params.phones?.map(phone => phone.value),
        emails: params.emails?.map(email => email.value),
        socials: params.socials,
        comment: params.comment,
      })
    }

    return useMutateEditClient.mutate({
      id: selectedClient.id,
      name: params.name,
      middleName: params.middleName,
      lastName: params.lastName,
      country: params.country,
      phones: params.phones?.map(phone => phone.value),
      emails: params.emails?.map(email => email.value),
      socials: params.socials,
      comment: params.comment,
    })
  }

  const isLoading = useMutateCreateClient.isPending || useMutateEditClient.isPending || useMutateRemoveClient.isPending

  const value: ClientContextType = useMemo(
    () => ({
      selectedClient,
      isModalOpen,
      isLoading,
      isEdit,
      form,
      openModal,
      closeModal,
      submitClientForm,
      removeClient,
    }),
    [selectedClient, isModalOpen, isLoading, isEdit, form],
  )

  return <ClientContext.Provider value={value}>{children}</ClientContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useClientContext(): ClientContextType {
  const context = useContext(ClientContext)
  if (!context) {
    throw new Error('useClientContext - ClientContext')
  }
  return context
}
