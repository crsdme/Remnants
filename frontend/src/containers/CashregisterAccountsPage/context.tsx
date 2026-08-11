import type { CashregisterAccountPopulatedDTO } from '@remnant/shared'
import type { ReactNode } from 'react'
import type { Resolver, UseFormReturn } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import {
  useCashregisterAccountCreate,
  useCashregisterAccountEdit,
  useCashregisterAccountRemove,
} from '@/api/hooks'
import { useLocale } from '@/utils/hooks'

interface CashregisterAccountContextType {
  selectedCashregisterAccount: CashregisterAccountPopulatedDTO | undefined
  isModalOpen: boolean
  isLoading: boolean
  isEdit: boolean
  form: UseFormReturn<CashregisterAccountFormValues>
  openModal: (cashregisterAccount?: CashregisterAccountPopulatedDTO) => void
  closeModal: () => void
  submitCashregisterAccountForm: (params: CashregisterAccountFormValues) => void
  removeCashregisterAccount: (params: { ids: string[] }) => void
}

const CashregisterAccountContext = createContext<CashregisterAccountContextType | undefined>(undefined)

interface CashregisterAccountFormValues {
  names: Record<string, string>
  currencies: string[]
  priority: number
  active: boolean
}

function getCashregisterAccountFormValues(cashregisterAccount?: CashregisterAccountPopulatedDTO): CashregisterAccountFormValues {
  if (!cashregisterAccount) {
    return {
      names: {},
      currencies: [],
      priority: 0,
      active: true,
    }
  }
  return {
    names: { ...cashregisterAccount.names },
    currencies: cashregisterAccount.currencies.map(currency => currency.id),
    priority: cashregisterAccount.priority,
    active: cashregisterAccount.active,
  }
}

export function CashregisterAccountProvider({ children }: { children: ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedCashregisterAccount, setSelectedCashregisterAccount] = useState<CashregisterAccountPopulatedDTO | undefined>(undefined)

  const { t } = useLocale()

  const formSchema = useMemo(() =>
    z.object({
      names: z.record(z.string({ required_error: t('form.errors.required') }).min(3, { message: t('form.errors.min_length', { count: 3 }) }).trim()),
      currencies: z.array(z.string({ required_error: t('form.errors.required') })).min(1, { message: t('form.errors.min_length', { count: 1 }) }),
      priority: z.number().default(0),
      active: z.boolean().default(true),
    }), [t])

  const form = useForm<CashregisterAccountFormValues>({
    resolver: zodResolver(formSchema) as Resolver<CashregisterAccountFormValues>,
    defaultValues: getCashregisterAccountFormValues(),
  })

  const queryClient = useQueryClient()

  const closeModal = () => {
    if (!isModalOpen)
      return
    setIsModalOpen(false)
    setIsEdit(false)
    setSelectedCashregisterAccount(undefined)
    form.reset()
  }

  const openModal = (cashregisterAccount?: CashregisterAccountPopulatedDTO) => {
    setIsModalOpen(true)
    setIsEdit(!!cashregisterAccount)
    setSelectedCashregisterAccount(cashregisterAccount ?? undefined)
    form.reset(getCashregisterAccountFormValues(cashregisterAccount))
  }

  const useMutateCreateCashregisterAccount = useCashregisterAccountCreate({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        void queryClient.invalidateQueries({ queryKey: ['cashregister-accounts'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateEditCashregisterAccount = useCashregisterAccountEdit({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        void queryClient.invalidateQueries({ queryKey: ['cashregister-accounts'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateRemoveCashregisterAccount = useCashregisterAccountRemove({
    options: {
      onSuccess: ({ data }) => {
        void queryClient.invalidateQueries({ queryKey: ['cashregister-accounts'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const removeCashregisterAccount = (params: { ids: string[] }) => {
    useMutateRemoveCashregisterAccount.mutate(params)
  }

  const submitCashregisterAccountForm = (params: CashregisterAccountFormValues) => {
    if (selectedCashregisterAccount === undefined) {
      return useMutateCreateCashregisterAccount.mutate({
        names: params.names,
        currencyIds: params.currencies,
        priority: params.priority,
        active: params.active,
      })
    }

    return useMutateEditCashregisterAccount.mutate({
      id: selectedCashregisterAccount.id,
      names: params.names,
      currencyIds: params.currencies,
      priority: params.priority,
      active: params.active,
    })
  }

  const isLoading = useMutateCreateCashregisterAccount.isPending || useMutateEditCashregisterAccount.isPending || useMutateRemoveCashregisterAccount.isPending

  const value: CashregisterAccountContextType = useMemo(
    () => ({
      selectedCashregisterAccount,
      isModalOpen,
      isLoading,
      isEdit,
      form,
      openModal,
      closeModal,
      submitCashregisterAccountForm,
      removeCashregisterAccount,
    }),
    [selectedCashregisterAccount, isModalOpen, isLoading, isEdit, form],
  )

  return <CashregisterAccountContext.Provider value={value}>{children}</CashregisterAccountContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCashregisterAccountContext(): CashregisterAccountContextType {
  const context = useContext(CashregisterAccountContext)
  if (!context) {
    throw new Error('useCashregisterAccountContext - CashregisterAccountContext')
  }
  return context
}
