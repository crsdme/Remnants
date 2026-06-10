import type { CurrencyDTO, ExchangeRateDTOPopulated } from '@remnant/shared'
import type { ReactNode } from 'react'
import type { Resolver, UseFormReturn } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'

import { useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, useMemo, useState } from 'react'

import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import {
  useCurrencyCreate,
  useCurrencyEdit,
  useCurrencyExchangeRateEdit,
  useCurrencyRemove,
} from '@/api/hooks/'
import { useLocale } from '@/utils/hooks'

interface CurrencyContextType {
  selectedCurrency: CurrencyDTO | undefined
  isModalOpen: boolean
  isExchangeRateModalOpen: boolean
  isLoading: boolean
  isEdit: boolean
  form: UseFormReturn<CurrencyFormValues>
  exchangeRateForm: UseFormReturn<ExchangeRateFormValues>
  openModal: (currency?: CurrencyDTO) => void
  closeModal: () => void
  submitCurrencyForm: (params: CurrencyFormValues) => void
  removeCurrency: (params: { ids: string[] }) => void
  openExchangeRateModal: (exchangeRate?: ExchangeRateDTOPopulated & { id?: string }) => void
  closeExchangeRateModal: () => void
  submitExchangeRateForm: (params: ExchangeRateFormValues) => void
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

interface CurrencyFormValues {
  names: Record<string, string>
  symbols: Record<string, string>
  scale: number
  priority: number
  active: boolean
}

interface ExchangeRateFormValues {
  rate: number
  comment: string
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isExchangeRateModalOpen, setIsExchangeRateModalOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyDTO | undefined>(undefined)
  const [selectedExchangeRate, setSelectedExchangeRate] = useState<ExchangeRateDTOPopulated & { id?: string } | undefined>(undefined)

  const { t } = useLocale()

  const formSchema = useMemo(() => createCurrencyFormSchema(t), [t])

  const form = useForm<CurrencyFormValues>({
    resolver: zodResolver(formSchema) as Resolver<CurrencyFormValues>,
    defaultValues: getCurrencyFormValues(),
  })

  const exchangeRateFormSchema = useMemo(() => createExchangeRateFormSchema(), [])

  const exchangeRateForm = useForm<ExchangeRateFormValues>({
    resolver: zodResolver(exchangeRateFormSchema) as Resolver<ExchangeRateFormValues>,
    defaultValues: getExchangeRateFormValues(),
  })

  const closeModal = () => {
    if (!isModalOpen)
      return
    setIsModalOpen(false)
    setIsEdit(false)
    setSelectedCurrency(undefined)
    form.reset()
  }

  const openModal = (currency?: CurrencyDTO) => {
    setIsModalOpen(true)
    setIsEdit(!!currency)
    setSelectedCurrency(currency)
    form.reset(getCurrencyFormValues(currency))
  }

  const closeExchangeRateModal = () => {
    if (!isExchangeRateModalOpen)
      return
    setIsExchangeRateModalOpen(false)
    setSelectedExchangeRate(undefined)
    exchangeRateForm.reset()
  }

  const openExchangeRateModal = (exchangeRate?: ExchangeRateDTOPopulated) => {
    setIsExchangeRateModalOpen(true)
    setSelectedExchangeRate(exchangeRate)
    exchangeRateForm.reset(getExchangeRateFormValues(exchangeRate))
  }

  const queryClient = useQueryClient()

  const useMutateCreateCurrency = useCurrencyCreate({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        void queryClient.invalidateQueries({ queryKey: ['currencies'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateEditExchangeRate = useCurrencyExchangeRateEdit({
    options: {
      onSuccess: ({ data }) => {
        closeExchangeRateModal()
        void queryClient.invalidateQueries({ queryKey: ['currencies', 'get', 'exchange-rate'] })
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
        void queryClient.invalidateQueries({ queryKey: ['currencies'] })
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
        void queryClient.invalidateQueries({ queryKey: ['currencies'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const submitCurrencyForm = (params: CurrencyFormValues) => {
    if (!isEdit)
      return useMutateCreateCurrency.mutate(params)

    if (!selectedCurrency)
      return

    return useMutateEditCurrency.mutate({ ...params, id: selectedCurrency.id })
  }

  const submitExchangeRateForm = (params: ExchangeRateFormValues) => {
    if (!selectedExchangeRate?.id)
      return
    useMutateEditExchangeRate.mutate({ ...params, id: selectedExchangeRate.id })
  }

  const removeCurrency = (params: { ids: string[] }) => {
    useMutateRemoveCurrency.mutate(params)
  }

  const isLoading = useMutateCreateCurrency.isPending || useMutateEditCurrency.isPending || useMutateRemoveCurrency.isPending || useMutateEditExchangeRate.isPending

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

function createCurrencyFormSchema(t: (key: string, options?: Record<string, unknown>) => string) {
  return z.object({
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
    scale: z.number().default(2),
    priority: z.number().default(0),
    active: z.boolean().default(true),
  })
}

function getCurrencyFormValues(currency?: CurrencyFormValues): CurrencyFormValues {
  if (!currency) {
    return {
      names: {},
      symbols: {},
      scale: 2,
      priority: 0,
      active: true,
    }
  }
  return {
    names: { ...currency.names },
    symbols: { ...currency.symbols },
    scale: currency.scale,
    priority: currency.priority,
    active: currency.active,
  }
}

function createExchangeRateFormSchema() {
  return z.object({
    rate: z.number().default(0),
    comment: z.string().optional(),
  })
}

function getExchangeRateFormValues(exchangeRate?: Pick<ExchangeRateDTOPopulated, 'rate' | 'comment'>): ExchangeRateFormValues {
  if (!exchangeRate) {
    return {
      rate: 0,
      comment: '',
    }
  }
  return {
    rate: exchangeRate.rate,
    comment: exchangeRate.comment ?? '',
  }
}
