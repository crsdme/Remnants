import type { MoneyTransactionDTO } from '@remnant/shared'
import type { ReactNode } from 'react'
import type { UseFormReturn } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { z } from 'zod'
import {
  useMoneyTransactionCreate,
  useMoneyTransferCancel,
  useMoneyTransferCreate,
  useMoneyTransferReceive,
} from '@/api/hooks'
import { usePermission } from '@/utils/hooks'

export const MONEY_TRANSACTION_TABS = ['add', 'account', 'cashregister'] as const
export type MoneyTransactionTab = (typeof MONEY_TRANSACTION_TABS)[number]

interface MoneyTransactionContextType {
  selectedMoneyTransaction: MoneyTransactionDTO | undefined
  isModalOpen: boolean
  isLoading: boolean
  isEdit: boolean
  addForm: UseFormReturn<any>
  accountForm: UseFormReturn<any>
  cashregisterForm: UseFormReturn<any>
  selectedTab: MoneyTransactionTab | undefined
  availableTabs: MoneyTransactionTab[]
  openModal: (moneyTransaction?: MoneyTransactionDTO) => void
  closeModal: () => void
  submitMoneyTransactionForm: (params: any) => void
  receiveMoneyTransfer: (transferId: string) => void
  cancelMoneyTransfer: (transferId: string) => void
  setSelectedTab: (tab: MoneyTransactionTab) => void
}

const MoneyTransactionContext = createContext<MoneyTransactionContextType | undefined>(undefined)

export function MoneyTransactionProvider({ children }: { children: ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedTab, setSelectedTab] = useState<MoneyTransactionTab | undefined>(undefined)
  const [selectedMoneyTransaction, setSelectedMoneyTransaction] = useState<MoneyTransactionDTO | undefined>(undefined)

  const { t } = useTranslation()
  const canCreate = usePermission('moneyTransaction.create')
  const canTransfer = usePermission('moneyTransaction.transfer')
  const availableTabs = useMemo(() => {
    const tabs: MoneyTransactionTab[] = []
    if (canCreate)
      tabs.push('add')
    if (canTransfer) {
      tabs.push('account')
      tabs.push('cashregister')
    }
    return tabs
  }, [canCreate, canTransfer])

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
      direction: 'in' as const,
      currency: '',
      amount: 0,
      description: '',
    },
  })

  const accountFormSchema = useMemo(() =>
    z.object({
      cashregister: z.string({ required_error: t('form.errors.required') }).min(1, t('form.errors.required')),
      accountFrom: z.string({ required_error: t('form.errors.required') }).min(1, t('form.errors.required')),
      accountTo: z.string({ required_error: t('form.errors.required') }).min(1, t('form.errors.required')),
      amount: z.number({ required_error: t('form.errors.required') }).min(1, t('form.errors.required')),
      currency: z.string({ required_error: t('form.errors.required') }).min(1, t('form.errors.required')),
      description: z.string().optional(),
    }), [t])

  const accountForm = useForm({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      cashregister: '',
      accountFrom: '',
      accountTo: '',
      currency: '',
      amount: 0,
      description: '',
    },
  })

  const cashregisterFormSchema = useMemo(() =>
    z.object({
      cashregisterFrom: z.string({ required_error: t('form.errors.required') }).min(1, t('form.errors.required')),
      cashregisterTo: z.string({ required_error: t('form.errors.required') }).min(1, t('form.errors.required')),
      accountFrom: z.string({ required_error: t('form.errors.required') }).min(1, t('form.errors.required')),
      accountTo: z.string({ required_error: t('form.errors.required') }).min(1, t('form.errors.required')),
      currency: z.string({ required_error: t('form.errors.required') }).min(1, t('form.errors.required')),
      amount: z.number({ required_error: t('form.errors.required') }).min(1, t('form.errors.required')),
      description: z.string().optional(),
      requiresReceiving: z.boolean().optional(),
    }), [t])

  const cashregisterForm = useForm({
    resolver: zodResolver(cashregisterFormSchema),
    defaultValues: {
      cashregisterFrom: '',
      cashregisterTo: '',
      accountFrom: '',
      accountTo: '',
      currency: '',
      amount: 0,
      description: '',
      requiresReceiving: true,
    },
  })

  const queryClient = useQueryClient()

  const closeModal = () => {
    if (!isModalOpen)
      return
    setIsModalOpen(false)
    setIsLoading(false)
    setIsEdit(false)
    setSelectedMoneyTransaction(undefined)
    addForm.reset()
    accountForm.reset()
    cashregisterForm.reset()
    setSelectedTab(undefined)
  }

  const openModal = (moneyTransaction: MoneyTransactionDTO | undefined) => {
    setIsModalOpen(true)
    setIsEdit(!!moneyTransaction)
    setSelectedMoneyTransaction(moneyTransaction ?? undefined)
    setSelectedTab(availableTabs[0])
  }

  const useMutateCreateMoneyTransaction = useMoneyTransactionCreate({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        void queryClient.invalidateQueries({ queryKey: ['money-transactions'] })
        void queryClient.invalidateQueries({ queryKey: ['cashregisters'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateCreateMoneyTransfer = useMoneyTransferCreate({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        void queryClient.invalidateQueries({ queryKey: ['money-transactions'] })
        void queryClient.invalidateQueries({ queryKey: ['cashregisters'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateReceiveMoneyTransfer = useMoneyTransferReceive({
    options: {
      onSuccess: ({ data }) => {
        void queryClient.invalidateQueries({ queryKey: ['money-transactions'] })
        void queryClient.invalidateQueries({ queryKey: ['cashregisters'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateCancelMoneyTransfer = useMoneyTransferCancel({
    options: {
      onSuccess: ({ data }) => {
        void queryClient.invalidateQueries({ queryKey: ['money-transactions'] })
        void queryClient.invalidateQueries({ queryKey: ['cashregisters'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const submitMoneyTransactionForm = (params: any) => {
    setIsLoading(true)

    if (selectedTab === 'add') {
      return useMutateCreateMoneyTransaction.mutate({
        type: params.direction === 'out' ? 'expense' : 'income',
        direction: params.direction,
        accountId: params.account,
        cashregisterId: params.cashregister,
        currencyId: params.currency,
        amount: params.amount,
        sourceModel: 'manual',
        description: params.description,
      })
    }

    if (selectedTab === 'account') {
      return useMutateCreateMoneyTransfer.mutate({
        type: 'transfer-account',
        accountFrom: params.accountFrom,
        accountTo: params.accountTo,
        cashregisterFrom: params.cashregister,
        cashregisterTo: params.cashregister,
        currencyId: params.currency,
        amount: params.amount,
        sourceModel: 'manual',
        description: params.description,
      })
    }

    if (selectedTab === 'cashregister') {
      return useMutateCreateMoneyTransfer.mutate({
        type: 'transfer-cashregister',
        accountFrom: params.accountFrom,
        accountTo: params.accountTo,
        cashregisterFrom: params.cashregisterFrom,
        cashregisterTo: params.cashregisterTo,
        currencyId: params.currency,
        amount: params.amount,
        sourceModel: 'manual',
        description: params.description,
        requiresReceiving: params.requiresReceiving,
      })
    }
  }

  const receiveMoneyTransfer = useCallback((transferId: string) => {
    useMutateReceiveMoneyTransfer.mutate({ transferId })
  }, [useMutateReceiveMoneyTransfer])

  const cancelMoneyTransfer = useCallback((transferId: string) => {
    useMutateCancelMoneyTransfer.mutate({ transferId })
  }, [useMutateCancelMoneyTransfer])

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
      availableTabs,
      openModal,
      closeModal,
      submitMoneyTransactionForm,
      receiveMoneyTransfer,
      cancelMoneyTransfer,
      setSelectedTab,
    }),
    [selectedMoneyTransaction, isModalOpen, isLoading, isEdit, addForm, accountForm, cashregisterForm, selectedTab, availableTabs, receiveMoneyTransfer, cancelMoneyTransfer],
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
