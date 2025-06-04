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
  useBatchCurrency,
  useCreateCurrency,
  useDuplicateCurrencies,
  useEditCurrency,
  useImportCurrencies,
  useRemoveCurrency,
} from '@/api/hooks/'

interface CurrencyContextType {
  selectedCurrency: Currency
  isModalOpen: boolean
  isLoading: boolean
  form: UseFormReturn
  toggleModal: (currency?: Currency) => void
  openModal: (currency?: Currency) => void
  closeModal: () => void
  submitCurrencyForm: (params) => void
  batchCurrency: (params) => void
  removeCurrency: (params: { ids: string[] }) => void
  importCurrencies: (params) => void
  duplicateCurrencies: (params: { ids: string[] }) => void
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

  const formSchema = useMemo(() =>
    z.object({
      names: z.record(
        z.string({ required_error: t('form.errors.required') })
          .min(3, { message: t('form.errors.min_length', { count: 3 }) })
          .trim(),
      ),
      symbols: z.record(
        z.string({ required_error: t('form.errors.required') })
          .min(3, { message: t('form.errors.min_length', { count: 3 }) })
          .trim(),
      ),
      priority: z.number().default(0),
      active: z.boolean().default(true),
    }), [t])

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      names: {},
      symbols: {},
      priority: 0,
      active: true,
    },
  })

  const queryClient = useQueryClient()

  const useMutateCreateCurrency = useCreateCurrency({
    options: {
      onSuccess: ({ data }) => {
        setIsModalOpen(false)
        setIsLoading(false)
        setSelectedCurrency(null)
        queryClient.invalidateQueries({ queryKey: ['currencies'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateDuplicateCurrencies = useDuplicateCurrencies({
    options: {
      onSuccess: ({ data }) => {
        queryClient.invalidateQueries({ queryKey: ['currencies'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateEditCurrency = useEditCurrency({
    options: {
      onSuccess: ({ data }) => {
        setIsModalOpen(false)
        setIsLoading(false)
        setSelectedCurrency(null)
        queryClient.invalidateQueries({ queryKey: ['currencies'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        setIsModalOpen(false)
        setIsLoading(false)
        setSelectedCurrency(null)
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateRemoveCurrency = useRemoveCurrency({
    options: {
      onSuccess: ({ data }) => {
        queryClient.invalidateQueries({ queryKey: ['currencies'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateImportCurrencies = useImportCurrencies({
    options: {
      onSuccess: ({ data }) => {
        queryClient.invalidateQueries({ queryKey: ['currencies'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateBatchCurrency = useBatchCurrency({
    options: {
      onSuccess: ({ data }) => {
        queryClient.invalidateQueries({ queryKey: ['currencies'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const openModal = (currency) => {
    let currencyValues = {}
    setIsModalOpen(true)
    if (currency) {
      setSelectedCurrency(currency)
      currencyValues = {
        names: { ...currency.names },
        symbols: { ...currency.symbols },
        priority: currency.priority,
        active: currency.active,
      }
    }
    form.reset(currencyValues)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setIsLoading(false)
    setSelectedCurrency(null)
    form.reset()
  }

  const toggleModal = currency => (isModalOpen ? closeModal() : openModal(currency))

  const submitCurrencyForm = (params) => {
    setIsLoading(true)
    if (!selectedCurrency) {
      useMutateCreateCurrency.mutate(params)
    }
    else {
      useMutateEditCurrency.mutate({ ...params, id: selectedCurrency.id })
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

  const duplicateCurrencies = (params) => {
    useMutateDuplicateCurrencies.mutate(params)
  }

  const value: CurrencyContextType = useMemo(
    () => ({
      selectedCurrency,
      isModalOpen,
      isLoading,
      form,
      toggleModal,
      openModal,
      closeModal,
      submitCurrencyForm,
      removeCurrency,
      batchCurrency,
      importCurrencies,
      duplicateCurrencies,
    }),
    [selectedCurrency, isModalOpen, isLoading, openModal, closeModal, submitCurrencyForm, removeCurrency, batchCurrency, importCurrencies, duplicateCurrencies],
  )

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCurrencyContext(): CurrencyContextType {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error('useCurrencyContext - CurrencyContext')
  }
  return context
}
