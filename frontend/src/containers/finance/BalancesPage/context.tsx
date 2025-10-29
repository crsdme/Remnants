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
  useCurrencyQuery,
  useSiteCreate,
  useSiteEdit,
  useSiteRemove,
} from '@/api/hooks'
import { useBalanceCreate } from '@/api/hooks/balance/useBalanceCreate'
import { useBalanceQuery } from '@/api/hooks/balance/useBalanceQuery'
import { useBalanceRemove } from '@/api/hooks/balance/useBalanceRemove'

interface BalanceContextType {
  selectedBalance: Balance
  balances: Balance[]
  currencies: Currency[]
  isModalOpen: boolean
  isLoading: boolean
  isEdit: boolean
  form: UseFormReturn
  openModal: (balance?: Balance) => void
  closeModal: () => void
  submitBalanceForm: (params) => void
  removeBalance: (params: { ids: string[] }) => void
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined)

interface BalanceProviderProps {
  children: ReactNode
}

export function BalanceProvider({ children }: BalanceProviderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedBalance, setSelectedBalance] = useState(null)

  const { t } = useTranslation()

  const formSchema = useMemo(() =>
    z.object({
      comment: z.string().optional(),
    }), [t])

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      comment: '',
    },
  })

  const queryClient = useQueryClient()

  const { data: { balances = [] } = {} } = useBalanceQuery(
    { filters: {} },
    { options: { select: response => ({ balances: response.data.balances }) } },
  )

  const { data: { currencies = [] } = {} } = useCurrencyQuery(
    { filters: { active: [true] } },
    { options: { select: response => ({ currencies: response.data.currencies }) } },
  )

  function getBalanceFormValues(balance) {
    if (!balance) {
      return {
        comment: '',
      }
    }
    return {
      comment: balance.comment,
    }
  }

  const closeModal = () => {
    if (!isModalOpen)
      return
    setIsModalOpen(false)
    setIsLoading(false)
    setIsEdit(false)
    setSelectedBalance(null)
    form.reset()
  }

  const openModal = (balance) => {
    setIsModalOpen(true)
    setIsEdit(!!balance)
    setSelectedBalance(balance)
    form.reset(getBalanceFormValues(balance))
  }

  const useMutateCreateBalance = useBalanceCreate({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        queryClient.invalidateQueries({ queryKey: ['balance', 'get'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.message || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateRemoveBalance = useBalanceRemove({
    options: {
      onSuccess: ({ data }) => {
        queryClient.invalidateQueries({ queryKey: ['balance', 'get'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.message || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const removeBalance = (params) => {
    useMutateRemoveBalance.mutate(params)
  }

  const submitBalanceForm = (params) => {
    setIsLoading(true)
    return useMutateCreateBalance.mutate(params)
  }

  const value: BalanceContextType = useMemo(
    () => ({
      balances,
      currencies,
      selectedBalance,
      isModalOpen,
      isLoading,
      isEdit,
      form,
      openModal,
      closeModal,
      submitBalanceForm,
      removeBalance,
    }),
    [balances, currencies, selectedBalance, isModalOpen, isLoading, isEdit, form, submitBalanceForm, removeBalance],
  )

  return <BalanceContext.Provider value={value}>{children}</BalanceContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useBalanceContext(): BalanceContextType {
  const context = useContext(BalanceContext)
  if (!context) {
    throw new Error('useBalanceContext - BalanceContext')
  }
  return context
}
