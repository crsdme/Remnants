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
  useMoneyTransactionCreate,
  useMoneyTransactionRemove,
} from '@/api/hooks'

interface MoneyTransactionContextType {
  selectedMoneyTransaction: MoneyTransaction
  isModalOpen: boolean
  isLoading: boolean
  isEdit: boolean
  addForm: UseFormReturn
  accountForm: UseFormReturn
  cashregisterForm: UseFormReturn
  selectedTab: string
  openModal: (moneyTransaction?: MoneyTransaction) => void
  closeModal: () => void
  submitMoneyTransactionForm: (params) => void
  removeMoneyTransaction: (params: { ids: string[] }) => void
  setSelectedTab: (tab: string) => void
}

const MoneyTransactionContext = createContext<MoneyTransactionContextType | undefined>(undefined)

interface MoneyTransactionProviderProps {
  children: ReactNode
}

export function MoneyTransactionProvider({ children }: MoneyTransactionProviderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedTab, setSelectedTab] = useState('add')
  const [selectedMoneyTransaction, setSelectedMoneyTransaction] = useState(null)

  const { t } = useTranslation()

  const addFormSchema = useMemo(() =>
    z.object({
      cashregister: z.string({ required_error: t('form.errors.required') }).min(1, t('form.errors.required')),
      account: z.string({ required_error: t('form.errors.required') }).min(1, t('form.errors.required')),
      direction: z.enum(['in', 'out'], { required_error: t('form.errors.required') }),
      currency: z.string({ required_error: t('form.errors.required') }).min(1, t('form.errors.required')),
      amount: z.number({ required_error: t('form.errors.required') }).min(1, t('form.errors.required')),
      description: z.string().optional(),
    }), [t])

  const addForm = useForm({
    resolver: zodResolver(addFormSchema),
    defaultValues: {
      cashregister: '',
      account: '',
      direction: 'in',
      currency: '',
      amount: 0,
      description: '',
    },
  })

  const accountFormSchema = useMemo(() =>
    z.object({
      cashregister: z.string({ required_error: t('form.errors.required') }).min(1, t('form.errors.required')),
      accountFrom: z.array(z.string({ required_error: t('form.errors.required') })).min(1, t('form.errors.required')),
      accountTo: z.array(z.string({ required_error: t('form.errors.required') })).min(1, t('form.errors.required')),
      amount: z.number({ required_error: t('form.errors.required') }).min(1, t('form.errors.required')),
      currency: z.array(z.string({ required_error: t('form.errors.required') })).min(1, t('form.errors.required')),
      description: z.string().optional(),
    }), [t])

  const accountForm = useForm({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      cashregister: '',
      accountFrom: [],
      accountTo: [],
      currency: [],
      amount: 0,
      description: '',
    },
  })

  const cashregisterFormSchema = useMemo(() =>
    z.object({
      cashregisterFrom: z.array(z.string({ required_error: t('form.errors.required') })).min(1, t('form.errors.required')),
      cashregisterTo: z.array(z.string({ required_error: t('form.errors.required') })).min(1, t('form.errors.required')),
      accountFrom: z.array(z.string({ required_error: t('form.errors.required') })).min(1, t('form.errors.required')),
      accountTo: z.array(z.string({ required_error: t('form.errors.required') })).min(1, t('form.errors.required')),
      currency: z.array(z.string({ required_error: t('form.errors.required') })).min(1, t('form.errors.required')),
      amount: z.number({ required_error: t('form.errors.required') }).min(1, t('form.errors.required')),
      description: z.string().optional(),
    }), [t])

  const cashregisterForm = useForm({
    resolver: zodResolver(cashregisterFormSchema),
    defaultValues: {
      cashregisterFrom: [],
      cashregisterTo: [],
      accountFrom: [],
      accountTo: [],
      currency: [],
      amount: 0,
      description: '',
    },
  })

  const queryClient = useQueryClient()

  const closeModal = () => {
    if (!isModalOpen)
      return
    setIsModalOpen(false)
    setIsLoading(false)
    setIsEdit(false)
    setSelectedMoneyTransaction(null)
    addForm.reset()
    accountForm.reset()
    cashregisterForm.reset()
  }

  const openModal = (moneyTransaction) => {
    setIsModalOpen(true)
    setIsEdit(!!moneyTransaction)
    setSelectedMoneyTransaction(moneyTransaction)
  }

  const useMutateCreateMoneyTransaction = useMoneyTransactionCreate({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        queryClient.invalidateQueries({ queryKey: ['money-transactions'] })
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

  const useMutateRemoveMoneyTransaction = useMoneyTransactionRemove({
    options: {
      onSuccess: ({ data }) => {
        queryClient.invalidateQueries({ queryKey: ['money-transactions'] })
        queryClient.invalidateQueries({ queryKey: ['cashregisters'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const removeMoneyTransaction = (params) => {
    useMutateRemoveMoneyTransaction.mutate(params)
  }

  const submitMoneyTransactionForm = (params) => {
    setIsLoading(true)

    if (selectedTab === 'add') {
      return useMutateCreateMoneyTransaction.mutate({
        type: 'income',
        direction: params.direction,
        account: params.account,
        cashregister: params.cashregister,
        currency: params.currency,
        amount: params.amount,
        sourceModel: 'manual',
        description: params.description,
      })
    }

    if (selectedTab === 'account') {
      return useMutateCreateMoneyTransaction.mutate({
        type: 'transfer-account',
        accountFrom: params.accountFrom[0],
        accountTo: params.accountTo[0],
        cashregister: params.cashregister,
        currency: params.currency[0],
        amount: params.amount,
        sourceModel: 'manual',
        description: params.description,
      })
    }

    if (selectedTab === 'cashregister') {
      return useMutateCreateMoneyTransaction.mutate({
        type: 'transfer-cashregister',
        accountFrom: params.accountFrom[0],
        accountTo: params.accountTo[0],
        cashregisterFrom: params.cashregisterFrom[0],
        cashregisterTo: params.cashregisterTo[0],
        currency: params.currency[0],
        amount: params.amount,
        sourceModel: 'manual',
        description: params.description,
      })
    }
  }

  const value: MoneyTransactionContextType = useMemo(
    () => ({
      selectedMoneyTransaction,
      isModalOpen,
      isLoading,
      isEdit,
      addForm,
      accountForm,
      cashregisterForm,
      selectedTab,
      openModal,
      closeModal,
      submitMoneyTransactionForm,
      removeMoneyTransaction,
      setSelectedTab,
    }),
    [selectedMoneyTransaction, isModalOpen, isLoading, isEdit, addForm, accountForm, selectedTab, setSelectedTab],
  )

  return <MoneyTransactionContext.Provider value={value}>{children}</MoneyTransactionContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useMoneyTransactionContext(): MoneyTransactionContextType {
  const context = useContext(MoneyTransactionContext)
  if (!context) {
    throw new Error('useMoneyTransactionContext - MoneyTransactionContext')
  }
  return context
}
