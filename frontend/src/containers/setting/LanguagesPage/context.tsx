import type { LanguageDTO } from '@remnant/shared'
import type { ReactNode } from 'react'
import type { Resolver, UseFormReturn } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'
import {
  useLanguageCreate,
  useLanguageEdit,
  useLanguageRemove,
} from '@/api/hooks'
import { useLocale } from '@/utils/hooks'

interface LanguageContextType {
  selectedLanguage: LanguageDTO | undefined
  isModalOpen: boolean
  isLoading: boolean
  isEdit: boolean
  form: UseFormReturn<LanguageFormValues>
  openModal: (language?: LanguageDTO) => void
  closeModal: () => void
  submitLanguageForm: (params: LanguageFormValues) => void
  removeLanguages: (params: { ids: string[] }) => void
}

interface LanguageFormValues {
  name: string
  code: string
  priority: number
  active: boolean
  main: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageDTO | undefined>(undefined)

  const { t } = useLocale()

  const formSchema = useMemo(() => createLanguageFormSchema(t), [t])

  const form = useForm({
    resolver: zodResolver(formSchema) as Resolver<LanguageFormValues>,
    defaultValues: getLanguageFormValues(),
  })

  const closeModal = () => {
    if (!isModalOpen)
      return
    setIsModalOpen(false)
    setIsEdit(false)
    setSelectedLanguage(undefined)
    form.reset()
  }

  const openModal = (language?: LanguageDTO) => {
    setIsModalOpen(true)
    setIsEdit(!!language)
    setSelectedLanguage(language)
    form.reset(getLanguageFormValues(language))
  }

  const queryClient = useQueryClient()

  const useMutateCreateLanguage = useLanguageCreate({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        void queryClient.invalidateQueries({ queryKey: ['languages'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateEditLanguage = useLanguageEdit({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        void queryClient.invalidateQueries({ queryKey: ['languages'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateRemoveLanguage = useLanguageRemove({
    options: {
      onSuccess: ({ data }) => {
        void queryClient.invalidateQueries({ queryKey: ['languages'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const submitLanguageForm = (params: LanguageFormValues) => {
    if (!isEdit || !selectedLanguage)
      return useMutateCreateLanguage.mutate(params)

    return useMutateEditLanguage.mutate({ ...params, id: selectedLanguage.id })
  }

  const removeLanguages = (params: { ids: string[] }) => {
    useMutateRemoveLanguage.mutate(params)
  }

  const isLoading = useMutateCreateLanguage.isPending || useMutateEditLanguage.isPending || useMutateRemoveLanguage.isPending

  const value: LanguageContextType = useMemo(
    () => ({
      selectedLanguage,
      isModalOpen,
      isLoading,
      isEdit,
      form,
      openModal,
      closeModal,
      submitLanguageForm,
      removeLanguages,
    }),
    [selectedLanguage, isModalOpen, isLoading, isEdit, form],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLanguageContext(): LanguageContextType {
  const context = useContext(LanguageContext)
  if (!context)
    throw new Error('useLanguageContext - LanguageContext')

  return context
}

function createLanguageFormSchema(t: (key: string, options?: Record<string, unknown>) => string) {
  return z.object({
    name: z.string({ required_error: t('form.errors.required') }).min(3, { message: t('form.errors.min_length', { count: 3 }) }).trim(),
    code: z.string({ required_error: t('form.errors.required') }).min(1, { message: t('form.errors.min_length', { count: 1 }) }).trim(),
    priority: z.number().default(0),
    active: z.boolean().default(true),
    main: z.boolean().default(false),
  })
}

function getLanguageFormValues(language?: LanguageDTO): LanguageFormValues {
  if (!language) {
    return {
      name: '',
      code: '',
      priority: 0,
      active: true,
      main: false,
    }
  }
  return {
    name: language.name,
    code: language.code,
    priority: language.priority,
    active: language.active,
    main: language.main,
  }
}
