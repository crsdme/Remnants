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
  useCurrencyBatch,
  useCurrencyCreate,
  useCurrencyDuplicate,
  useCurrencyEdit,
  useCurrencyExchangeRateEdit,
  useCurrencyImport,
  useCurrencyRemove,
} from '@/api/hooks/'

import { SUPPORTED_LANGUAGES } from '@/utils/constants'

interface CurrencyContextType {
  selectedCurrency: Currency
  isModalOpen: boolean
  isExchangeRateModalOpen: boolean
  isLoading: boolean
  isEdit: boolean
  form: UseFormReturn
  exchangeRateForm: UseFormReturn
  openModal: (currency?: Currency) => void
  closeModal: () => void
  submitCurrencyForm: (params) => void
  batchCurrency: (params) => void
  removeCurrency: (params: { ids: string[] }) => void
  importCurrencies: (params) => void
  duplicateCurrencies: (params: { ids: string[] }) => void
  openExchangeRateModal: (exchangeRate: ExchangeRate) => void
  closeExchangeRateModal: () => void
  submitExchangeRateForm: (params) => void
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

interface CurrencyProviderProps {
  children: ReactNode
}

export function CurrencyProvider({ children }: CurrencyProviderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isExchangeRateModalOpen, setIsExchangeRateModalOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState(null)
  const [selectedExchangeRate, setSelectedExchangeRate] = useState(null)

  const { t } = useTranslation()

  const defaultLanguageValues = SUPPORTED_LANGUAGES.reduce((acc, lang) => ({ ...acc, [lang]: '' }), {})

  const formSchema = useMemo(() =>
    z.object({
      names: z.record(
        z.string({ required_error: t('form.errors.required') })
          .min(3, { message: t('form.errors.min_length', { count: 3 }) })
          .trim(),
      ),
      symbols: z.record(
        z.string({ required_error: t('form.errors.required') })
          .min(1, { message: t('form.errors.min_length', { count: 1 }) })
          .trim(),
      ),
      priority: z.number().default(0),
      active: z.boolean().default(true),
    }), [t])

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      names: defaultLanguageValues,
      symbols: defaultLanguageValues,
      priority: 0,
      active: true,
    },
  })

  const exchangeRateFormSchema = useMemo(() =>
    z.object({
      rate: z.number().default(0),
      comment: z.string().optional(),
    }), [t])

  const exchangeRateForm = useForm({
    resolver: zodResolver(exchangeRateFormSchema),
    defaultValues: {
      rate: 0,
      comment: '',
    },
  })

  const getCurrencyFormValues = (currency) => {
    if (!currency) {
      return {
        names: defaultLanguageValues,
        symbols: defaultLanguageValues,
        priority: 0,
        active: true,
      }
    }
    return {
      names: { ...currency.names },
      symbols: { ...currency.symbols },
      priority: currency.priority,
      active: currency.active,
    }
  }

  const closeModal = () => {
    if (!isModalOpen)
      return
    setIsModalOpen(false)
    setIsLoading(false)
    setIsEdit(false)
    setSelectedCurrency(null)
    form.reset()
  }

  const openModal = (currency) => {
    setIsModalOpen(true)
    setIsEdit(!!currency)
    setSelectedCurrency(currency)
    form.reset(getCurrencyFormValues(currency))
  }

  const closeExchangeRateModal = () => {
    if (!isExchangeRateModalOpen)
      return
    setIsExchangeRateModalOpen(false)
    setIsLoading(false)
    setSelectedExchangeRate(null)
    exchangeRateForm.reset()
  }

  const openExchangeRateModal = (exchangeRate) => {
    setIsExchangeRateModalOpen(true)
    setSelectedExchangeRate(exchangeRate)
    exchangeRateForm.reset({
      rate: exchangeRate?.rate,
      comment: exchangeRate?.comment,
    })
  }

  const queryClient = useQueryClient()

  const useMutateCreateCurrency = useCurrencyCreate({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        queryClient.invalidateQueries({ queryKey: ['currencies'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateDuplicateCurrencies = useCurrencyDuplicate({
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

  const useMutateEditExchangeRate = useCurrencyExchangeRateEdit({
    options: {
      onSuccess: ({ data }) => {
        closeExchangeRateModal()
        queryClient.invalidateQueries({ queryKey: ['currencies', 'get', 'exchange-rate'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeExchangeRateModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateEditCurrency = useCurrencyEdit({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        queryClient.invalidateQueries({ queryKey: ['currencies'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateRemoveCurrency = useCurrencyRemove({
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

  const useMutateImportCurrencies = useCurrencyImport({
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

  const useMutateBatchCurrency = useCurrencyBatch({
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

  const submitCurrencyForm = (params) => {
    setIsLoading(true)
    if (!isEdit)
      return useMutateCreateCurrency.mutate(params)

    return useMutateEditCurrency.mutate({ ...params, id: selectedCurrency.id })
  }

  const submitExchangeRateForm = (params) => {
    setIsLoading(true)
    params.id = selectedExchangeRate.id
    useMutateEditExchangeRate.mutate(params)
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
      isEdit,
      isExchangeRateModalOpen,
      selectedExchangeRate,
      exchangeRateForm,
      form,
      openModal,
      closeModal,
      submitCurrencyForm,
      removeCurrency,
      batchCurrency,
      importCurrencies,
      duplicateCurrencies,
      openExchangeRateModal,
      closeExchangeRateModal,
      submitExchangeRateForm,
    }),
    [selectedCurrency, isModalOpen, isLoading, isEdit, isExchangeRateModalOpen, selectedExchangeRate],
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
