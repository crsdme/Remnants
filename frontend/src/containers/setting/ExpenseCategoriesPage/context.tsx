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
  useExpenseCategoryCreate,
  useExpenseCategoryEdit,
  useExpenseCategoryRemove,
} from '@/api/hooks'

interface ExpenseCategoryContextType {
  selectedExpenseCategory: ExpenseCategory
  isModalOpen: boolean
  isLoading: boolean
  isEdit: boolean
  form: UseFormReturn
  openModal: (expenseCategory?: ExpenseCategory) => void
  closeModal: () => void
  submitExpenseCategoryForm: (params) => void
  removeExpenseCategory: (params: { ids: string[] }) => void
}

const ExpenseCategoryContext = createContext<ExpenseCategoryContextType | undefined>(undefined)

interface ExpenseCategoryProviderProps {
  children: ReactNode
}

export function ExpenseCategoryProvider({ children }: ExpenseCategoryProviderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedExpenseCategory, setSelectedExpenseCategory] = useState(null)

  const { t } = useTranslation()

  const formSchema = useMemo(() =>
    z.object({
      names: z.record(z.string({ required_error: t('form.errors.required') }).min(3, { message: t('form.errors.min_length', { count: 3 }) }).trim()),
      color: z.string({ required_error: t('form.errors.required') }),
      priority: z.number({ required_error: t('form.errors.required') }),
      comment: z.string().optional(),
    }), [t])

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      names: {},
      color: '',
      priority: 0,
      comment: '',
    },
  })

  const queryClient = useQueryClient()

  function getExpenseCategoryFormValues(expenseCategory) {
    if (!expenseCategory) {
      return {
        names: {},
        color: '',
        priority: 0,
        comment: '',
      }
    }
    return {
      names: expenseCategory.names,
      color: expenseCategory.color,
      priority: expenseCategory.priority,
      comment: expenseCategory.comment,
    }
  }

  const closeModal = () => {
    if (!isModalOpen)
      return
    setIsModalOpen(false)
    setIsLoading(false)
    setIsEdit(false)
    setSelectedExpenseCategory(null)
    form.reset()
  }

  const openModal = (expenseCategory) => {
    setIsModalOpen(true)
    setIsEdit(!!expenseCategory)
    setSelectedExpenseCategory(expenseCategory)
    form.reset(getExpenseCategoryFormValues(expenseCategory))
  }

  const useMutateCreateExpenseCategory = useExpenseCategoryCreate({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        queryClient.invalidateQueries({ queryKey: ['expense-categories'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateEditExpenseCategory = useExpenseCategoryEdit({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        queryClient.invalidateQueries({ queryKey: ['expense-categories'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateRemoveExpenseCategory = useExpenseCategoryRemove({
    options: {
      onSuccess: ({ data }) => {
        queryClient.invalidateQueries({ queryKey: ['expense-categories'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const removeExpenseCategory = (params) => {
    useMutateRemoveExpenseCategory.mutate(params)
  }

  const submitExpenseCategoryForm = (params) => {
    setIsLoading(true)
    if (!selectedExpenseCategory)
      return useMutateCreateExpenseCategory.mutate(params)

    return useMutateEditExpenseCategory.mutate({ ...params, id: selectedExpenseCategory.id })
  }

  const value: ExpenseCategoryContextType = useMemo(
    () => ({
      selectedExpenseCategory,
      isModalOpen,
      isLoading,
      isEdit,
      form,
      openModal,
      closeModal,
      submitExpenseCategoryForm,
      removeExpenseCategory,
    }),
    [selectedExpenseCategory, isModalOpen, isLoading, isEdit, form],
  )

  return <ExpenseCategoryContext.Provider value={value}>{children}</ExpenseCategoryContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useExpenseCategoryContext(): ExpenseCategoryContextType {
  const context = useContext(ExpenseCategoryContext)
  if (!context) {
    throw new Error('useExpenseCategoryContext - ExpenseCategoryContext')
  }
  return context
}
