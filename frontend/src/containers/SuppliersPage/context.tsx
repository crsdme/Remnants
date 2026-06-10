import type { SupplierDTO } from '@remnant/shared'
import type { ReactNode } from 'react'
import type { Resolver, UseFormReturn } from 'react-hook-form'

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

export interface SupplierFormValues {
  name: string
  emails: { value: string }[]
  phones: { value: string }[]
  socials: { type: string, value: string }[]
  comment?: string
}

interface SupplierContextType {
  selectedSupplier: SupplierDTO | undefined
  isModalOpen: boolean
  isLoading: boolean
  isEdit: boolean
  form: UseFormReturn<SupplierFormValues>
  openModal: (supplier?: SupplierDTO) => void
  closeModal: () => void
  submitForm: (params: SupplierFormValues) => void
  removeSupplier: (params: { ids: string[] }) => void
}

const SupplierContext = createContext<SupplierContextType | undefined>(undefined)

export function SupplierProvider({ children }: { children: ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierDTO | undefined>(undefined)

  const { t } = useTranslation()

  const formSchema = useMemo(() => createSupplierFormSchema(t), [t])

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(formSchema) as Resolver<SupplierFormValues>,
    defaultValues: getSupplierFormValues(),
  })

  const queryClient = useQueryClient()

  const closeModal = () => {
    if (!isModalOpen)
      return
    setIsModalOpen(false)
    setIsEdit(false)
    setSelectedSupplier(undefined)
    form.reset(getSupplierFormValues())
  }

  const openModal = (supplier?: SupplierDTO) => {
    setIsModalOpen(true)
    setIsEdit(!!supplier)
    setSelectedSupplier(supplier)
    form.reset(getSupplierFormValues(supplier))
  }

  const useMutateCreateSupplier = useSupplierCreate({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        void queryClient.invalidateQueries({ queryKey: ['suppliers'] })
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
        void queryClient.invalidateQueries({ queryKey: ['suppliers'] })
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
        void queryClient.invalidateQueries({ queryKey: ['suppliers'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const removeSupplier = (params: { ids: string[] }) => {
    useMutateRemoveSupplier.mutate(params)
  }

  const submitForm = (params: SupplierFormValues) => {
    const payload = {
      ...params,
      phones: params.phones.map(p => p.value).filter(p => p.length >= 10),
      emails: params.emails.map(e => e.value).filter(e => e.length > 0),
      socials: params.socials.filter(s => s.value.trim().length > 0),
    }
    if (!selectedSupplier || !isEdit)
      return useMutateCreateSupplier.mutate(payload)

    return useMutateEditSupplier.mutate({ ...payload, id: selectedSupplier.id })
  }

  const isLoading = useMutateCreateSupplier.isPending || useMutateEditSupplier.isPending || useMutateRemoveSupplier.isPending

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

function createSupplierFormSchema(t: (key: string, options?: Record<string, unknown>) => string) {
  const minPhone = 10
  const minPhoneMsg = t('form.errors.min_length', { count: minPhone })
  return z.object({
    name: z.string({ required_error: t('form.errors.required') }).min(3, { message: t('form.errors.min_length', { count: 3 }) }).trim(),
    emails: z.array(z.object({
      value: z.union([z.string().email(), z.literal('')]),
    })),
    phones: z.array(z.object({ value: z.string() })),
    socials: z.array(z.object({ type: z.string(), value: z.string() })),
    comment: z.string().optional(),
  }).superRefine((data, ctx) => {
    data.phones.forEach((row, index) => {
      const phone = row.value
      if (phone.length > 0 && phone.length < minPhone) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: minPhoneMsg,
          path: ['phones', index, 'value'],
        })
      }
    })
  })
}

function getSupplierFormValues(supplier?: SupplierDTO): SupplierFormValues {
  if (supplier === undefined) {
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
    emails: (supplier.emails ?? []).map(value => ({ value })),
    phones: (supplier.phones ?? []).map(value => ({ value })),
    socials: supplier.socials ?? [],
    comment: supplier.comment ?? '',
  }
}
