import type { ReactNode } from 'react'
import {
  useBatchCurrency,
  useCreateCurrency,
  useEditCurrency,
  useImportCurrencies,
  useRemoveCurrency,
} from '@/api/hooks/'

import { useQueryClient } from '@tanstack/react-query'

import { createContext, useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { toast } from 'sonner'

interface CurrencyContextType {
  selectedCurrency: Currency
  isModalOpen: boolean
  isLoading: boolean
  toggleModal: (currency?: Currency) => void
  openModal: (currency?: Currency) => void
  closeModal: () => void
  submitCurrencyForm: (params) => void
  batchCurrency: (params) => void
  removeCurrency: (params: { _ids: string[] }) => void
  importCurrencies: (params) => void
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

interface CurrencyProviderProps {
  children: ReactNode
}

export function CurrencyProvider({ children }: CurrencyProviderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState(null)

  const { t } = useTranslation()

  const queryClient = useQueryClient()

  const useMutateCreateCurrency = useCreateCurrency({
    options: {
      onSuccess: () => {
        setIsModalOpen(false)
        setIsLoading(false)
        setSelectedCurrency(null)
        queryClient.invalidateQueries({ queryKey: ['currencies'] })
      },
    },
  })

  const useMutateEditCurrency = useEditCurrency({
    options: {
      onSuccess: () => {
        setIsModalOpen(false)
        setIsLoading(false)
        setSelectedCurrency(null)
        queryClient.invalidateQueries({ queryKey: ['currencies'] })
      },
    },
  })

  const useMutateRemoveCurrency = useRemoveCurrency({
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['currencies'] })
      },
    },
  })

  const useMutateImportCurrencies = useImportCurrencies({
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['currencies'] })
      },
    },
  })

  const useMutateBatchCurrency = useBatchCurrency({
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['currencies'] })
        toast.success(t('page.currencies.toast.batchCurrency.success'))
      },
      onError: () => {
        toast.error(t('page.currencies.toast.batchCurrency.error'))
      },
    },
  })

  const openModal = (currency) => {
    setIsModalOpen(true)
    if (currency)
      setSelectedCurrency(currency)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setIsLoading(false)
    setSelectedCurrency(null)
  }

  const toggleModal = currency => (isModalOpen ? closeModal() : openModal(currency))

  const submitCurrencyForm = (params) => {
    setIsLoading(true)
    if (!selectedCurrency) {
      useMutateCreateCurrency.mutate(params)
    }
    else {
      useMutateEditCurrency.mutate({ ...params, _id: selectedCurrency._id })
    }
  }

  const removeCurrency = (params) => {
    useMutateRemoveCurrency.mutate(params)
  }

  const batchCurrency = (params) => {
    useMutateBatchCurrency.mutate(params)
  }

  const importCurrencies = (params) => {
    useMutateImportCurrencies.mutate(params)
  }

  const value: CurrencyContextType = {
    selectedCurrency,
    isModalOpen,
    isLoading,
    toggleModal,
    openModal,
    closeModal,
    submitCurrencyForm,
    removeCurrency,
    batchCurrency,
    importCurrencies,
  }

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}

export function useCurrencyContext(): CurrencyContextType {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error('useCurrencyContext - CurrencyContext')
  }
  return context
}
