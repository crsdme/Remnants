import type { ExpenseCategoryDTO } from '@remnant/shared'
import type { ReactNode } from 'react'
import type { Resolver, UseFormReturn } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import {
  useExpenseCategoryCreate,
  useExpenseCategoryEdit,
  useExpenseCategoryRemove,
} from '@/api/hooks'
import { useLocale } from '@/utils/hooks'

interface ExpenseCategoryContextType {
  selectedExpenseCategory: ExpenseCategoryDTO | undefined
  isModalOpen: boolean
  isLoading: boolean
  isEdit: boolean
  form: UseFormReturn<ExpenseCategoryFormValues>
  openModal: (expenseCategory?: ExpenseCategoryDTO) => void
  closeModal: () => void
  submitExpenseCategoryForm: (params: ExpenseCategoryFormValues) => void
  removeExpenseCategory: (params: { ids: string[] }) => void
}

const ExpenseCategoryContext = createContext<ExpenseCategoryContextType | undefined>(undefined)

interface ExpenseCategoryFormValues {
  names: Record<string, string>
  color: string
  priority: number
  comment: string
}

export function ExpenseCategoryProvider({ children }: { children: ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedExpenseCategory, setSelectedExpenseCategory] = useState<ExpenseCategoryDTO | undefined>(undefined)

  const { t } = useLocale()

  const formSchema = useMemo(() => createExpenseCategoryFormSchema(t), [t])

  const form = useForm<ExpenseCategoryFormValues>({
    resolver: zodResolver(formSchema) as Resolver<ExpenseCategoryFormValues>,
    defaultValues: getExpenseCategoryFormValues(),
  })

  const queryClient = useQueryClient()

  const closeModal = () => {
    if (!isModalOpen)
      return
    setIsModalOpen(false)
    setIsEdit(false)
    setSelectedExpenseCategory(undefined)
    form.reset()
  }

  const openModal = (expenseCategory?: ExpenseCategoryDTO) => {
    setIsModalOpen(true)
    setIsEdit(!!expenseCategory)
    setSelectedExpenseCategory(expenseCategory)
    form.reset(getExpenseCategoryFormValues(expenseCategory))
  }

  const useMutateCreateExpenseCategory = useExpenseCategoryCreate({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        void queryClient.invalidateQueries({ queryKey: ['expense-categories'] })
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
        void queryClient.invalidateQueries({ queryKey: ['expense-categories'] })
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
        void queryClient.invalidateQueries({ queryKey: ['expense-categories'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const removeExpenseCategory = (params: { ids: string[] }) => {
    useMutateRemoveExpenseCategory.mutate(params)
  }

  const submitExpenseCategoryForm = (params: ExpenseCategoryFormValues) => {
    if (!selectedExpenseCategory || !isEdit)
      return useMutateCreateExpenseCategory.mutate(params)

    return useMutateEditExpenseCategory.mutate({ ...params, id: selectedExpenseCategory.id })
  }

  const isLoading = useMutateCreateExpenseCategory.isPending || useMutateEditExpenseCategory.isPending || useMutateRemoveExpenseCategory.isPending

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

function createExpenseCategoryFormSchema(t: (key: string, options?: Record<string, unknown>) => string) {
  return z.object({
    names: z.record(z.string({ required_error: t('form.errors.required') }).min(3, { message: t('form.errors.min_length', { count: 3 }) }).trim()),
    color: z.string({ required_error: t('form.errors.required') }),
    priority: z.number({ required_error: t('form.errors.required') }),
    comment: z.string().optional(),
  })
}

function getExpenseCategoryFormValues(expenseCategory?: ExpenseCategoryDTO): ExpenseCategoryFormValues {
  if (!expenseCategory) {
    return {
      names: {},
      color: '#ffffff',
      priority: 0,
      comment: '',
    }
  }
  return {
    names: { ...expenseCategory.names },
    color: expenseCategory.color ?? '#ffffff',
    priority: expenseCategory.priority,
    comment: expenseCategory.comment ?? '',
  }
}
