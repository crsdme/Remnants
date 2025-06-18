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
  useLanguageBatch,
  useLanguageCreate,
  useLanguageDuplicate,
  useLanguageEdit,
  useLanguageImport,
  useLanguageRemove,
} from '@/api/hooks'

interface LanguageContextType {
  selectedLanguage: Language
  isModalOpen: boolean
  isLoading: boolean
  isEdit: boolean
  form: UseFormReturn
  openModal: (language?: Language) => void
  closeModal: () => void
  submitLanguageForm: (params: Language) => void
  batchLanguage: (params: { ids?: string[], filters?: any, params: any }) => void
  removeLanguages: (params: { ids: string[] }) => void
  importLanguages: (params) => void
  duplicateLanguages: (params: { ids: string[] }) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
  children: ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState(null)

  const { t } = useTranslation()

  const formSchema = useMemo(() =>
    z.object({
      name: z.string({ required_error: t('form.errors.required') }).min(3, { message: t('form.errors.min_length', { count: 3 }) }).trim(),
      code: z.string({ required_error: t('form.errors.required') }).min(1, { message: t('form.errors.min_length', { count: 1 }) }).trim(),
      priority: z.number().default(0),
      active: z.boolean().default(true),
      main: z.boolean().default(false),
    }), [t])

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      code: '',
      priority: 0,
      active: true,
      main: false,
    },
  })

  const getLanguageFormValues = (language) => {
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

  const closeModal = () => {
    if (!isModalOpen)
      return
    setIsModalOpen(false)
    setIsLoading(false)
    setIsEdit(false)
    setSelectedLanguage(null)
    form.reset()
  }

  const openModal = (language) => {
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
        queryClient.invalidateQueries({ queryKey: ['languages'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateDuplicateLanguages = useLanguageDuplicate({
    options: {
      onSuccess: ({ data }) => {
        queryClient.invalidateQueries({ queryKey: ['languages'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateEditLanguage = useLanguageEdit({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        queryClient.invalidateQueries({ queryKey: ['languages'] })
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
        queryClient.invalidateQueries({ queryKey: ['languages'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateImportLanguages = useLanguageImport({
    options: {
      onSuccess: ({ data }) => {
        queryClient.invalidateQueries({ queryKey: ['languages'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateBatchLanguage = useLanguageBatch({
    options: {
      onSuccess: ({ data }) => {
        queryClient.invalidateQueries({ queryKey: ['languages'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const submitLanguageForm = (params) => {
    setIsLoading(true)
    if (!isEdit)
      return useMutateCreateLanguage.mutate(params)

    return useMutateEditLanguage.mutate({ ...params, id: selectedLanguage.id })
  }

  const removeLanguages = (params) => {
    useMutateRemoveLanguage.mutate(params)
  }

  const batchLanguage = (params) => {
    useMutateBatchLanguage.mutate(params)
  }

  const importLanguages = (params) => {
    useMutateImportLanguages.mutate(params)
  }

  const duplicateLanguages = (params) => {
    useMutateDuplicateLanguages.mutate(params)
  }

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
      batchLanguage,
      importLanguages,
      duplicateLanguages,
    }),
    [selectedLanguage, isModalOpen, isLoading, isEdit, form],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLanguageContext(): LanguageContextType {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguageContext - LanguageContext')
  }
  return context
}
