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
  useExpenseCreate,
  useExpenseEdit,
  useExpenseRemove,
} from '@/api/hooks'

interface ExpenseContextType {
  selectedExpense: Expense
  isModalOpen: boolean
  isLoading: boolean
  isEdit: boolean
  form: UseFormReturn
  openModal: (expense?: Expense) => void
  closeModal: () => void
  submitExpenseForm: (params) => void
  removeExpense: (params: { ids: string[] }) => void
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined)

interface ExpenseProviderProps {
  children: ReactNode
}

export function ExpenseProvider({ children }: ExpenseProviderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState(null)

  const { t } = useTranslation()

  const formSchema = useMemo(() =>
    z.object({
      amount: z.number({ required_error: t('form.errors.required') }).min(0, { message: t('form.errors.min_value', { count: 0 }) }),
      currency: z.string({ required_error: t('form.errors.required') }),
      cashregister: z.string({ required_error: t('form.errors.required') }),
      cashregisterAccount: z.string({ required_error: t('form.errors.required') }),
      categories: z.array(z.string({ required_error: t('form.errors.required') })),
    }), [t])

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      currency: '',
      cashregister: '',
      cashregisterAccount: '',
      categories: [],
    },
  })

  const queryClient = useQueryClient()

  function getExpenseFormValues(expense) {
    if (!expense) {
      return {
        amount: 0,
        currency: '',
        cashregister: '',
        cashregisterAccount: '',
        categories: [],
      }
    }
    return {
      amount: expense.amount,
      currency: expense.currency.id,
      cashregister: expense.cashregister.id,
      cashregisterAccount: expense.cashregisterAccount.id,
      categories: expense.categories.map(category => category.id),
    }
  }

  const closeModal = () => {
    if (!isModalOpen)
      return
    setIsModalOpen(false)
    setIsLoading(false)
    setIsEdit(false)
    setSelectedExpense(null)
    form.reset()
  }

  const openModal = (expense) => {
    setIsModalOpen(true)
    setIsEdit(!!expense)
    setSelectedExpense(expense)
    form.reset(getExpenseFormValues(expense))
  }

  const useMutateCreateExpense = useExpenseCreate({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        queryClient.invalidateQueries({ queryKey: ['expenses'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateEditExpense = useExpenseEdit({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        queryClient.invalidateQueries({ queryKey: ['expenses'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateRemoveExpense = useExpenseRemove({
    options: {
      onSuccess: ({ data }) => {
        queryClient.invalidateQueries({ queryKey: ['expenses'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const removeExpense = (params) => {
    useMutateRemoveExpense.mutate(params)
  }

  const submitExpenseForm = (params) => {
    setIsLoading(true)
    params.type = 'manual'
    if (!selectedExpense)
      return useMutateCreateExpense.mutate(params)

    return useMutateEditExpense.mutate({ ...params, id: selectedExpense.id })
  }

  const value: ExpenseContextType = useMemo(
    () => ({
      selectedExpense,
      isModalOpen,
      isLoading,
      isEdit,
      form,
      openModal,
      closeModal,
      submitExpenseForm,
      removeExpense,
    }),
    [selectedExpense, isModalOpen, isLoading, isEdit, form],
  )

  return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useExpenseContext(): ExpenseContextType {
  const context = useContext(ExpenseContext)
  if (!context) {
    throw new Error('useExpenseContext - ExpenseContext')
  }
  return context
}
