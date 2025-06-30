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
  useCashregisterAccountCreate,
  useCashregisterAccountEdit,
  useCashregisterAccountRemove,
} from '@/api/hooks'
import { SUPPORTED_LANGUAGES } from '@/utils/constants'

interface CashregisterAccountContextType {
  selectedCashregisterAccount: CashregisterAccount
  isModalOpen: boolean
  isLoading: boolean
  isEdit: boolean
  form: UseFormReturn
  openModal: (cashregisterAccount?: CashregisterAccount) => void
  closeModal: () => void
  submitCashregisterAccountForm: (params) => void
  removeCashregisterAccount: (params: { ids: string[] }) => void
}

const CashregisterAccountContext = createContext<CashregisterAccountContextType | undefined>(undefined)

interface CashregisterAccountProviderProps {
  children: ReactNode
}

export function CashregisterAccountProvider({ children }: CashregisterAccountProviderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedCashregisterAccount, setSelectedCashregisterAccount] = useState(null)

  const { t } = useTranslation()

  const defaultLanguageValues = SUPPORTED_LANGUAGES.reduce((acc, lang) => ({ ...acc, [lang]: '' }), {})

  const formSchema = useMemo(() =>
    z.object({
      names: z.record(z.string({ required_error: t('form.errors.required') }).min(3, { message: t('form.errors.min_length', { count: 3 }) }).trim()),
      currencies: z.array(z.string({ required_error: t('form.errors.required') })).min(1, { message: t('form.errors.min_length', { count: 1 }) }),
      priority: z.number().default(0),
      active: z.boolean().default(true),
    }), [t])

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      names: defaultLanguageValues,
      currencies: [],
      priority: 0,
      active: true,
    },
  })

  const queryClient = useQueryClient()

  function getCashregisterAccountFormValues(cashregisterAccount) {
    if (!cashregisterAccount) {
      return {
        names: defaultLanguageValues,
        currencies: [],
        priority: 0,
        active: true,
      }
    }
    return {
      names: { ...cashregisterAccount.names },
      currencies: cashregisterAccount.currencies.map(currency => currency.id),
      priority: cashregisterAccount.priority,
      active: cashregisterAccount.active,
    }
  }

  const closeModal = () => {
    if (!isModalOpen)
      return
    setIsModalOpen(false)
    setIsLoading(false)
    setIsEdit(false)
    setSelectedCashregisterAccount(null)
    form.reset()
  }

  const openModal = (cashregisterAccount) => {
    setIsModalOpen(true)
    setIsEdit(!!cashregisterAccount)
    setSelectedCashregisterAccount(cashregisterAccount)
    form.reset(getCashregisterAccountFormValues(cashregisterAccount))
  }

  const useMutateCreateCashregisterAccount = useCashregisterAccountCreate({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        queryClient.invalidateQueries({ queryKey: ['cashregister-accounts'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateEditCashregisterAccount = useCashregisterAccountEdit({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        queryClient.invalidateQueries({ queryKey: ['cashregister-accounts'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateRemoveCashregisterAccount = useCashregisterAccountRemove({
    options: {
      onSuccess: ({ data }) => {
        queryClient.invalidateQueries({ queryKey: ['cashregister-accounts'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const removeCashregisterAccount = (params) => {
    useMutateRemoveCashregisterAccount.mutate(params)
  }

  const submitCashregisterAccountForm = (params) => {
    setIsLoading(true)
    if (!selectedCashregisterAccount)
      return useMutateCreateCashregisterAccount.mutate(params)

    return useMutateEditCashregisterAccount.mutate({ ...params, id: selectedCashregisterAccount.id })
  }

  const value: CashregisterAccountContextType = useMemo(
    () => ({
      selectedCashregisterAccount,
      isModalOpen,
      isLoading,
      isEdit,
      form,
      openModal,
      closeModal,
      submitCashregisterAccountForm,
      removeCashregisterAccount,
    }),
    [selectedCashregisterAccount, isModalOpen, isLoading, isEdit, form],
  )

  return <CashregisterAccountContext.Provider value={value}>{children}</CashregisterAccountContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCashregisterAccountContext(): CashregisterAccountContextType {
  const context = useContext(CashregisterAccountContext)
  if (!context) {
    throw new Error('useCashregisterAccountContext - CashregisterAccountContext')
  }
  return context
}
