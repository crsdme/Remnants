import type { CashregisterPopulatedDTO } from '@remnant/shared'
import type { ReactNode } from 'react'
import type { Resolver, UseFormReturn } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import {
  useCashregisterCreate,
  useCashregisterEdit,
  useCashregisterRemove,
} from '@/api/hooks'
import { useLocale } from '@/utils/hooks'

interface CashregisterContextType {
  selectedCashregister: CashregisterPopulatedDTO | undefined
  isModalOpen: boolean
  isLoading: boolean
  isEdit: boolean
  form: UseFormReturn<CashregisterFormValues>
  openModal: (cashregister?: CashregisterPopulatedDTO) => void
  closeModal: () => void
  submitCashregisterForm: (params: CashregisterFormValues) => void
  removeCashregister: (params: { ids: string[] }) => void
}

interface CashregisterFormValues {
  names: Record<string, string>
  accounts: string[]
  priority: number
  active: boolean
}

function getCashregisterFormValues(cashregister?: CashregisterPopulatedDTO): CashregisterFormValues {
  if (!cashregister) {
    return {
      names: {},
      accounts: [],
      priority: 0,
      active: true,
    }
  }
  return {
    names: { ...cashregister.names },
    accounts: cashregister.accounts.map(account => account.id),
    priority: cashregister.priority,
    active: cashregister.active,
  }
}

const CashregisterContext = createContext<CashregisterContextType | undefined>(undefined)

export function CashregisterProvider({ children }: { children: ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedCashregister, setSelectedCashregister] = useState<CashregisterPopulatedDTO | undefined>(undefined)

  const { t } = useLocale()

  const formSchema = useMemo(() =>
    z.object({
      names: z.record(z.string({ required_error: t('form.errors.required') }).min(3, { message: t('form.errors.min_length', { count: 3 }) }).trim()),
      accounts: z.array(z.string()).optional().default([]),
      priority: z.number().default(0),
      active: z.boolean().default(true),
    }), [t])

  const form = useForm<CashregisterFormValues>({
    resolver: zodResolver(formSchema) as Resolver<CashregisterFormValues>,
    defaultValues: getCashregisterFormValues(),
  })

  const queryClient = useQueryClient()

  const closeModal = () => {
    if (!isModalOpen)
      return
    setIsModalOpen(false)
    setIsEdit(false)
    setSelectedCashregister(undefined)
    form.reset()
  }

  const openModal = (cashregister?: CashregisterPopulatedDTO) => {
    setIsModalOpen(true)
    setIsEdit(!!cashregister)
    setSelectedCashregister(cashregister ?? undefined)
    form.reset(getCashregisterFormValues(cashregister))
  }

  const useMutateCreateCashregister = useCashregisterCreate({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        void queryClient.invalidateQueries({ queryKey: ['cashregisters'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateEditCashregister = useCashregisterEdit({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        void queryClient.invalidateQueries({ queryKey: ['cashregisters'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateRemoveCashregister = useCashregisterRemove({
    options: {
      onSuccess: ({ data }) => {
        void queryClient.invalidateQueries({ queryKey: ['cashregisters'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const removeCashregister = (params: { ids: string[] }) => {
    useMutateRemoveCashregister.mutate(params)
  }

  const submitCashregisterForm = (params: CashregisterFormValues) => {
    if (selectedCashregister === undefined)
      return useMutateCreateCashregister.mutate(params)

    return useMutateEditCashregister.mutate({
      id: selectedCashregister.id,
      names: params.names,
      accounts: params.accounts,
      priority: params.priority,
      active: params.active,
    })
  }

  const isLoading = useMutateCreateCashregister.isPending || useMutateEditCashregister.isPending || useMutateRemoveCashregister.isPending

  const value: CashregisterContextType = useMemo(
    () => ({
      selectedCashregister,
      isModalOpen,
      isLoading,
      isEdit,
      form,
      openModal,
      closeModal,
      submitCashregisterForm,
      removeCashregister,
    }),
    [selectedCashregister, isModalOpen, isLoading, isEdit, form],
  )

  return <CashregisterContext.Provider value={value}>{children}</CashregisterContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCashregisterContext(): CashregisterContextType {
  const context = useContext(CashregisterContext)
  if (!context) {
    throw new Error('useCashregisterContext - CashregisterContext')
  }
  return context
}
