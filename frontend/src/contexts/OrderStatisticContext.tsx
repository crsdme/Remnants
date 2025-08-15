import type { ReactNode } from 'react'
import type { UseFormReturn } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { createContext, useContext, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { z } from 'zod'
import {
  useOrderStatisticQuery,
} from '@/api/hooks'

interface OrderStatisticContextType {
  isLoading: boolean
  isFetching: boolean
  form: UseFormReturn
  statistics: any
  onSubmit: (data: any) => void
}

const OrderStatisticContext = createContext<OrderStatisticContextType | undefined>(undefined)

interface OrderStatisticProviderProps {
  children: ReactNode
}

export function OrderStatisticProvider({ children }: OrderStatisticProviderProps) {
  const [filters, setFilters] = useState({
    date: {
      from: new Date(new Date().setHours(0, 0, 0, 0)),
      to: new Date(new Date().setHours(23, 59, 59, 999)),
    },
    cashregister: '',
    cashregisterAccount: '',
    currency: '',
  })

  const { t } = useTranslation()

  const { data: { 
    statistics = {
    averageCheck: 0,
    ordersAmount: [],
    ordersCount: 0, 
    paidAmount: [],
    paidCount: 0, 
    income: [],
    profit: [],
    expenses: [],
    expensesCount: 0,
    expensesTotal: [],
    unpaidAmount: [], 
    unpaidCount: 0,
  } } = {}, isLoading, isFetching } = useOrderStatisticQuery(
    { pagination: { full: true }, filters },
    { options: {
      select: response => ({
        statistics: response.data.statistics,
      }),  
      placeholderData: prevData => prevData,
    } },
  )

  const onSubmit = (data: any) => {
    setFilters(data)
  }

  const formSchema = useMemo(() =>
    z.object({
      date: z.record(z.date()),
      cashregister: z.string().optional(),
      cashregisterAccount: z.string().optional(),
    }), [t])

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: {
        from: new Date(new Date().setHours(0, 0, 0, 0)),
        to: new Date(new Date().setHours(23, 59, 59, 999)),
      },
      cashregister: '',
      cashregisterAccount: '',
    },
  })
  
  const value: OrderStatisticContextType = useMemo(
    () => ({
      isLoading,
      isFetching,
      form,
      onSubmit,
      statistics,
    }),
    [isLoading, form, onSubmit, statistics],
  )

  return <OrderStatisticContext.Provider value={value}>{children}</OrderStatisticContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useOrderStatisticContext(): OrderStatisticContextType {
  const context = useContext(OrderStatisticContext)
  if (!context) {
    throw new Error('useOrderStatisticContext - OrderStatisticContext')
  }
  return context
}
