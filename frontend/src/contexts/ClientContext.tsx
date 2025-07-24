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
  useClientCreate,
  useClientEdit,
  useClientRemove,
} from '@/api/hooks'

interface ClientContextType {
  selectedClient: Client
  isModalOpen: boolean
  isLoading: boolean
  isEdit: boolean
  form: UseFormReturn
  openModal: (client?: Client) => void
  closeModal: () => void
  submitClientForm: (params) => void
  removeClient: (params: { ids: string[] }) => void
}

const ClientContext = createContext<ClientContextType | undefined>(undefined)

interface ClientProviderProps {
  children: ReactNode
}

export function ClientProvider({ children }: ClientProviderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)

  const { t } = useTranslation()

  const formSchema = useMemo(() =>
    z.object({
      name: z.string({ required_error: t('form.errors.required') }).min(3, { message: t('form.errors.min_length', { count: 3 }) }).trim(),
      middleName: z.string().optional(),
      lastName: z.string().optional(),
      phones: z.array(z.string().min(10, { message: t('form.errors.min_length', { count: 10 }) })).optional(),
      emails: z.array(z.string().email()).optional(),
    }), [t])

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      middleName: '',
      lastName: '',
      phones: [],
      emails: [],
    },
  })

  const queryClient = useQueryClient()

  function getClientFormValues(client) {
    if (!client) {
      return {
        name: '',
        middleName: '',
        lastName: '',
        phones: [],
        emails: [],
      }
    }
    return {
      name: client.name,
      middleName: client.middleName,
      lastName: client.lastName,
      phones: client.phones,
      emails: client.emails,
    }
  }

  const closeModal = () => {
    if (!isModalOpen)
      return
    setIsModalOpen(false)
    setIsLoading(false)
    setIsEdit(false)
    setSelectedClient(null)
    form.reset()
  }

  const openModal = (client) => {
    setIsModalOpen(true)
    setIsEdit(!!client)
    setSelectedClient(client)
    form.reset(getClientFormValues(client))
  }

  const useMutateCreateClient = useClientCreate({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        queryClient.invalidateQueries({ queryKey: ['clients'] })
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
        queryClient.invalidateQueries({ queryKey: ['clients'] })
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
        queryClient.invalidateQueries({ queryKey: ['clients'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const removeClient = (params) => {
    useMutateRemoveClient.mutate(params)
  }

  const submitClientForm = (params) => {
    setIsLoading(true)
    if (!selectedClient)
      return useMutateCreateClient.mutate(params)

    return useMutateEditClient.mutate({ ...params, id: selectedClient.id })
  }

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
