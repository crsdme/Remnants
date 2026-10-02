import type { BalanceComputedDTO, BalanceDTO, CurrencyDTO } from '@remnant/shared'
import type { ReactNode } from 'react'
import type { UseFormReturn } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { useCurrencyQuery } from '@/api/hooks'
import { useBalanceCreate } from '@/api/hooks/balance/useBalanceCreate'
import { useBalanceQuery } from '@/api/hooks/balance/useBalanceQuery'
import { useBalanceRemove } from '@/api/hooks/balance/useBalanceRemove'
import { useCurrentBalanceQuery } from '@/api/hooks/balance/useCurrentBalanceQuery'
import { useLocale } from '@/utils/hooks'

interface BalanceContextType {
  selectedBalance: BalanceDTO | BalanceComputedDTO | null
  balances: BalanceDTO[]
  currentBalance?: BalanceComputedDTO
  currencies: CurrencyDTO[]
  isModalOpen: boolean
  isDetailOpen: boolean
  isLoading: boolean
  isEdit: boolean
  form: UseFormReturn<{ comment?: string }>
  openModal: () => void
  closeModal: () => void
  openDetail: (balance: BalanceDTO | BalanceComputedDTO) => void
  closeDetail: () => void
  submitBalanceForm: (params: { comment?: string }) => void
  removeBalance: (params: { ids: string[] }) => void
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined)

// Stable wide range so queryKey does not thrash and new snapshots always appear
const BALANCE_LIST_FILTERS = {
  date: {
    from: new Date('2020-01-01T00:00:00.000Z'),
    to: new Date('2100-01-01T00:00:00.000Z'),
  },
}

export function BalanceProvider({ children }: { children: ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedBalance, setSelectedBalance] = useState<BalanceDTO | BalanceComputedDTO | null>(null)

  const { t } = useLocale()

  const formSchema = useMemo(() =>
    z.object({
      comment: z.string().optional(),
    }), [])

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      comment: '',
    },
  })

  const queryClient = useQueryClient()

  const { balances } = useBalanceQuery({ filters: BALANCE_LIST_FILTERS })
  const { currentBalance } = useCurrentBalanceQuery({})
  const { currencies } = useCurrencyQuery({ filters: { active: [true] } })

  const closeModal = () => {
    if (!isModalOpen)
      return
    setIsModalOpen(false)
    setIsLoading(false)
    setIsEdit(false)
    form.reset()
  }

  const openModal = () => {
    setIsModalOpen(true)
    setIsEdit(false)
    form.reset({ comment: '' })
  }

  const openDetail = (balance: BalanceDTO | BalanceComputedDTO) => {
    setSelectedBalance(balance)
    setIsDetailOpen(true)
  }

  const closeDetail = () => {
    setIsDetailOpen(false)
    setSelectedBalance(null)
  }

  const invalidateBalance = () => {
    void queryClient.invalidateQueries({ queryKey: ['balance', 'get'] })
    void queryClient.invalidateQueries({ queryKey: ['balance', 'get-current'] })
  }

  const useMutateCreateBalance = useBalanceCreate({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        invalidateBalance()
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.message || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateRemoveBalance = useBalanceRemove({
    options: {
      onSuccess: ({ data }) => {
        invalidateBalance()
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.message || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const removeBalance = (params: { ids: string[] }) => {
    useMutateRemoveBalance.mutate({ id: params.ids[0] })
  }

  const submitBalanceForm = (params: { comment?: string }) => {
    setIsLoading(true)
    return useMutateCreateBalance.mutate(params)
  }

  const value: BalanceContextType = useMemo(
    () => ({
      balances,
      currentBalance,
      currencies,
      selectedBalance,
      isModalOpen,
      isDetailOpen,
      isLoading,
      isEdit,
      form,
      openModal,
      closeModal,
      openDetail,
      closeDetail,
      submitBalanceForm,
      removeBalance,
    }),
    [balances, currentBalance, currencies, selectedBalance, isModalOpen, isDetailOpen, isLoading, isEdit, form],
  )

  return <BalanceContext.Provider value={value}>{children}</BalanceContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useBalanceContext(): BalanceContextType {
  const context = useContext(BalanceContext)
  if (!context) {
    throw new Error('useBalanceContext - BalanceContext')
  }
  return context
}
