import type { CreateExpenseRequest, EditExpenseRequest, ExpensePopulatedDTO } from '@remnant/shared'
import type { Dispatch, ReactNode, SetStateAction } from 'react'
import type { Resolver, UseFormReturn } from 'react-hook-form'
import type { UploadedFile } from '@/components/FileUploadDnd'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import {
  useExpenseCreate,
  useExpenseEdit,
  useExpenseRemove,
} from '@/api/hooks'
import { useLocale } from '@/utils/hooks'

interface ExpenseContextType {
  selectedExpense: ExpensePopulatedDTO | null
  isModalOpen: boolean
  isLoading: boolean
  isEdit: boolean
  form: UseFormReturn<ExpenseFormValues>
  files: UploadedFile[]
  setFiles: Dispatch<SetStateAction<UploadedFile[]>>
  openModal: (expense?: ExpensePopulatedDTO) => void
  closeModal: () => void
  submitExpenseForm: (params: ExpenseFormValues) => void
  removeExpense: (params: { ids: string[] }) => void
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined)

export interface ExpenseFormValues {
  amount: number
  currency: string
  cashregister: string
  cashregisterAccount: string
  categories: string[]
  comment: string
}

function mapExpenseFiles(expense?: ExpensePopulatedDTO): UploadedFile[] {
  if (!expense?.files)
    return []

  return expense.files.map(file => ({
    id: file.id,
    file: file.path,
    preview: file.type.startsWith('image/') ? file.path : '',
    name: file.name,
    type: file.type,
    path: file.path,
    filename: file.filename,
    isNew: false,
  }))
}

function getExpenseFormValues(expense?: ExpensePopulatedDTO): ExpenseFormValues {
  if (!expense) {
    return {
      amount: 0,
      currency: '',
      cashregister: '',
      cashregisterAccount: '',
      categories: [],
      comment: '',
    }
  }
  return {
    amount: expense.amount,
    currency: expense.currency.id,
    cashregister: expense.cashregister.id,
    cashregisterAccount: expense.cashregisterAccount.id,
    categories: expense.categories.map(category => category.id),
    comment: expense.comment ?? '',
  }
}

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<ExpensePopulatedDTO | null>(null)
  const [files, setFiles] = useState<UploadedFile[]>([])

  const { t } = useLocale()

  const formSchema = useMemo(() =>
    z.object({
      amount: z.number({ required_error: t('form.errors.required') }).gt(0, { message: t('form.errors.required') }),
      currency: z.string({ required_error: t('form.errors.required') }).min(1, { message: t('form.errors.required') }),
      cashregister: z.string({ required_error: t('form.errors.required') }).min(1, { message: t('form.errors.required') }),
      cashregisterAccount: z.string({ required_error: t('form.errors.required') }).min(1, { message: t('form.errors.required') }),
      categories: z.array(z.string()).min(1, { message: t('form.errors.required') }),
      comment: z.string().optional(),
    }), [t])

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(formSchema) as Resolver<ExpenseFormValues>,
    defaultValues: getExpenseFormValues(),
  })

  const queryClient = useQueryClient()

  const openModal = (expense?: ExpensePopulatedDTO) => {
    const nextFiles = mapExpenseFiles(expense)
    setIsModalOpen(true)
    setIsEdit(!!expense)
    setSelectedExpense(expense ?? null)
    setFiles(nextFiles)
    form.reset(getExpenseFormValues(expense))
  }

  const closeModal = () => {
    if (!isModalOpen)
      return
    setIsModalOpen(false)
    setIsEdit(false)
    setSelectedExpense(null)
    setFiles([])
    form.reset(getExpenseFormValues())
  }

  const useMutateCreateExpense = useExpenseCreate({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        void queryClient.invalidateQueries({ queryKey: ['expenses'] })
        void queryClient.invalidateQueries({ queryKey: ['money-transactions'] })
        void queryClient.invalidateQueries({ queryKey: ['statistics'] })
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
        void queryClient.invalidateQueries({ queryKey: ['expenses'] })
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
        void queryClient.invalidateQueries({ queryKey: ['expenses'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const removeExpense = (params: { ids: string[] }) => {
    useMutateRemoveExpense.mutate(params)
  }

  const submitExpenseForm = (params: ExpenseFormValues) => {
    const filesPayload = files.map(file => ({
      id: file.id,
      filename: file.filename ?? '',
      name: file.name,
      type: file.type,
      path: file.path,
      isNew: file.isNew,
    }))

    const payload = selectedExpense
      ? { ...params, id: selectedExpense.id, type: 'manual', files: filesPayload }
      : { ...params, type: 'manual', files: filesPayload }

    const formData = new FormData()
    for (const [key, value] of Object.entries(payload)) {
      if (value === undefined)
        continue
      formData.append(key, JSON.stringify(value))
    }

    files
      .filter((file): file is UploadedFile & { file: File } => file.isNew && typeof file.file !== 'string')
      .forEach((file) => {
        formData.append('uploadedFiles', file.file, file.name)
        formData.append('uploadedFilesIds', file.id)
      })

    if (!selectedExpense)
      return useMutateCreateExpense.mutate(formData as unknown as CreateExpenseRequest)

    return useMutateEditExpense.mutate(formData as unknown as EditExpenseRequest)
  }

  const isLoading = useMutateCreateExpense.isPending || useMutateEditExpense.isPending || useMutateRemoveExpense.isPending

  const value: ExpenseContextType = useMemo(
    () => ({
      selectedExpense,
      isModalOpen,
      isLoading,
      isEdit,
      form,
      files,
      setFiles,
      openModal,
      closeModal,
      submitExpenseForm,
      removeExpense,
    }),
    [selectedExpense, isModalOpen, isLoading, isEdit, form, files],
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
