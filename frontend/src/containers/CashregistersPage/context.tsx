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
  useCashregisterCreate,
  useCashregisterEdit,
  useCashregisterRemove,
} from '@/api/hooks'
import { SUPPORTED_LANGUAGES } from '@/utils/constants'

interface CashregisterContextType {
  selectedCashregister: Cashregister
  isModalOpen: boolean
  isLoading: boolean
  isEdit: boolean
  form: UseFormReturn
  openModal: (cashregister?: Cashregister) => void
  closeModal: () => void
  submitCashregisterForm: (params) => void
  removeCashregister: (params: { ids: string[] }) => void
}

const CashregisterContext = createContext<CashregisterContextType | undefined>(undefined)

interface CashregisterProviderProps {
  children: ReactNode
}

export function CashregisterProvider({ children }: CashregisterProviderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedCashregister, setSelectedCashregister] = useState(null)

  const { t } = useTranslation()

  const defaultLanguageValues = SUPPORTED_LANGUAGES.reduce((acc, lang) => ({ ...acc, [lang]: '' }), {})

  const formSchema = useMemo(() =>
    z.object({
      names: z.record(z.string({ required_error: t('form.errors.required') }).min(3, { message: t('form.errors.min_length', { count: 3 }) }).trim()),
      accounts: z.array(z.string()).optional().default([]),
      priority: z.number().default(0),
      active: z.boolean().default(true),
    }), [t])

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      names: defaultLanguageValues,
      accounts: [],
      priority: 0,
      active: true,
    },
  })

  const queryClient = useQueryClient()

  function getCashregisterFormValues(cashregister) {
    if (!cashregister) {
      return {
        names: defaultLanguageValues,
        accounts: [],
        priority: 0,
        active: true,
      }
    }
    return {
      names: { ...cashregister.names },
      accounts: cashregister.accounts.map(account => account.id),
      priority: cashregister.priority,
      active: cashregister.active,
    }
  }

  const closeModal = () => {
    if (!isModalOpen)
      return
    setIsModalOpen(false)
    setIsLoading(false)
    setIsEdit(false)
    setSelectedCashregister(null)
    form.reset()
  }

  const openModal = (cashregister) => {
    setIsModalOpen(true)
    setIsEdit(!!cashregister)
    setSelectedCashregister(cashregister)
    form.reset(getCashregisterFormValues(cashregister))
  }

  const useMutateCreateCashregister = useCashregisterCreate({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        queryClient.invalidateQueries({ queryKey: ['cashregisters'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateEditCashregister = useCashregisterEdit({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        queryClient.invalidateQueries({ queryKey: ['cashregisters'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateRemoveCashregister = useCashregisterRemove({
    options: {
      onSuccess: ({ data }) => {
        queryClient.invalidateQueries({ queryKey: ['cashregisters'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const removeCashregister = (params) => {
    useMutateRemoveCashregister.mutate(params)
  }

  const submitCashregisterForm = (params) => {
    setIsLoading(true)
    if (!selectedCashregister)
      return useMutateCreateCashregister.mutate(params)

    return useMutateEditCashregister.mutate({ ...params, id: selectedCashregister.id })
  }

  const value: CashregisterContextType = useMemo(
    () => ({
      selectedCashregister,
      isModalOpen,
      isLoading,
      isEdit,
      form,
      openModal,
      closeModal,
      submitCashregisterForm,
      removeCashregister,
    }),
    [selectedCashregister, isModalOpen, isLoading, isEdit, form],
  )

  return <CashregisterContext.Provider value={value}>{children}</CashregisterContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCashregisterContext(): CashregisterContextType {
  const context = useContext(CashregisterContext)
  if (!context) {
    throw new Error('useCashregisterContext - CashregisterContext')
  }
  return context
}
