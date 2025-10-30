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
  useSupplierCreate,
  useSupplierEdit,
  useSupplierRemove,
} from '@/api/hooks'

interface SupplierContextType {
  selectedSupplier: Supplier
  isModalOpen: boolean
  isLoading: boolean
  isEdit: boolean
  form: UseFormReturn
  openModal: (supplier?: Supplier) => void
  closeModal: () => void
  submitForm: (params) => void
  removeSupplier: (params: { ids: string[] }) => void
}

const SupplierContext = createContext<SupplierContextType | undefined>(undefined)

interface SupplierProviderProps {
  children: ReactNode
}

export function SupplierProvider({ children }: SupplierProviderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState(null)

  const { t } = useTranslation()

  const formSchema = useMemo(() =>
    z.object({
      name: z.string({ required_error: t('form.errors.required') }).min(3, { message: t('form.errors.min_length', { count: 3 }) }).trim(),
      emails: z.array(z.string().email()).optional(),
      phones: z.array(z.string().min(10, { message: t('form.errors.min_length', { count: 10 }) })).optional(),
      socials: z.array(z.object({ type: z.string(), value: z.string() })).optional(),
      comment: z.string().optional(),
    }), [t])

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      phones: [],
      emails: [],
      socials: [],
      comment: '',
    },
  })

  const queryClient = useQueryClient()

  function getSupplierFormValues(supplier) {
    if (!supplier) {
      return {
        name: '',
        phones: [],
        emails: [],
        socials: [],
        comment: '',
      }
    }
    return {
      name: supplier.name,
      emails: supplier.emails,
      phones: supplier.phones,
      socials: supplier.socials,
      comment: supplier.comment,
    }
  }

  const closeModal = () => {
    if (!isModalOpen)
      return
    setIsModalOpen(false)
    setIsLoading(false)
    setIsEdit(false)
    setSelectedSupplier(null)
    form.reset()
  }

  const openModal = (supplier) => {
    setIsModalOpen(true)
    setIsEdit(!!supplier)
    setSelectedSupplier(supplier)
    form.reset(getSupplierFormValues(supplier))
  }

  const useMutateCreateSupplier = useSupplierCreate({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        queryClient.invalidateQueries({ queryKey: ['suppliers'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateEditSupplier = useSupplierEdit({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        queryClient.invalidateQueries({ queryKey: ['suppliers'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateRemoveSupplier = useSupplierRemove({
    options: {
      onSuccess: ({ data }) => {
        queryClient.invalidateQueries({ queryKey: ['suppliers'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const removeSupplier = (params) => {
    useMutateRemoveSupplier.mutate(params)
  }

  const submitForm = (params) => {
    setIsLoading(true)
    if (!selectedSupplier)
      return useMutateCreateSupplier.mutate(params)

    return useMutateEditSupplier.mutate({ ...params, id: selectedSupplier.id })
  }

  const value: SupplierContextType = useMemo(
    () => ({
      selectedSupplier,
      isModalOpen,
      isLoading,
      isEdit,
      form,
      openModal,
      closeModal,
      submitForm,
      removeSupplier,
    }),
    [selectedSupplier, isModalOpen, isLoading, isEdit, form],
  )

  return <SupplierContext.Provider value={value}>{children}</SupplierContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSupplierContext(): SupplierContextType {
  const context = useContext(SupplierContext)
  if (!context) {
    throw new Error('useSupplierContext - SupplierContext')
  }
  return context
}
