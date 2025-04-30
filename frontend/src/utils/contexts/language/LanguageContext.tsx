import type { ReactNode } from 'react'
import { useBatchLanguages, useCreateLanguage, useDuplicateLanguages, useEditLanguage, useImportLanguages, useRemoveLanguages } from '@/api/hooks'

import { useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

interface LanguageContextType {
  selectedLanguage: Language
  isModalOpen: boolean
  isLoading: boolean
  toggleModal: (language?: Language) => void
  openModal: (language?: Language) => void
  closeModal: () => void
  submitLanguageForm: (params: Language) => void
  batchLanguage: (params: { _ids?: string[], filters?: any, params: any }) => void
  removeLanguage: (params: { _ids: string[] }) => void
  importLanguages: (params) => void
  duplicateLanguages: (params: { _ids: string[] }) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
  children: ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState(null)

  const { t } = useTranslation()

  const queryClient = useQueryClient()

  const useMutateCreateLanguage = useCreateLanguage({
    options: {
      onSuccess: () => {
        setIsModalOpen(false)
        setIsLoading(false)
        setSelectedLanguage(null)
        queryClient.invalidateQueries({ queryKey: ['languages'] })
      },
    },
  })

  const useMutateDuplicateLanguages = useDuplicateLanguages({
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['languages'] })
        toast.success(t('page.languages.toast.duplicateLanguages.success'))
      },
      onError: () => {
        toast.error(t('page.languages.toast.duplicateLanguages.error'))
      },
    },
  })

  const useMutateEditLanguage = useEditLanguage({
    options: {
      onSuccess: () => {
        setIsModalOpen(false)
        setIsLoading(false)
        setSelectedLanguage(null)
        queryClient.invalidateQueries({ queryKey: ['languages'] })
      },
    },
  })

  const useMutateRemoveLanguage = useRemoveLanguages({
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['languages'] })
      },
    },
  })

  const useMutateImportLanguages = useImportLanguages({
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['languages'] })
      },
    },
  })

  const useMutateBatchLanguage = useBatchLanguages({
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['languages'] })
        toast.success(t('page.languages.toast.batchLanguage.success'))
      },
      onError: () => {
        toast.error(t('page.languages.toast.batchLanguage.error'))
      },
    },
  })

  const openModal = (language) => {
    setIsModalOpen(true)
    if (language)
      setSelectedLanguage(language)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setIsLoading(false)
    setSelectedLanguage(null)
  }

  const toggleModal = language => (isModalOpen ? closeModal() : openModal(language))

  const submitLanguageForm = (params) => {
    setIsLoading(true)
    if (!selectedLanguage) {
      useMutateCreateLanguage.mutate(params)
    }
    else {
      useMutateEditLanguage.mutate({ ...params, _id: selectedLanguage._id })
    }
  }

  const removeLanguage = (params) => {
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

  const value: LanguageContextType = {
    selectedLanguage,
    isModalOpen,
    isLoading,
    toggleModal,
    openModal,
    closeModal,
    submitLanguageForm,
    removeLanguage,
    batchLanguage,
    importLanguages,
    duplicateLanguages,
  }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguageContext(): LanguageContextType {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguageContext - LanguageContext')
  }
  return context
}
