import type { ReactNode } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { createContext, useContext, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'

import { z } from 'zod'
import {
  useOrderStatisticQuery,
} from '@/api/hooks'

interface OrderStatisticContextType {
  isLoading: boolean
  isFetching: boolean
  form: any
  statistics: any
  onSubmit: (data: any) => void
}

const OrderStatisticContext = createContext<OrderStatisticContextType | undefined>(undefined)

export function OrderStatisticProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState(() => getDefaultFilters())

  const {
    statistics = {
      range: { from: new Date(new Date().setHours(0, 0, 0, 0)), to: new Date(new Date().setHours(23, 59, 59, 999)) },
      orders: {
        count: 0,
        amount: [],
        paid: {
          count: 0,
          amount: [],
        },
        unpaid: {
          count: 0,
          amount: [],
        },
      },
      payments: {
        count: 0,
        amount: [],
        income: {
          count: 0,
          amount: [],
        },
        expense: {
          count: 0,
          categories: [],
          amount: [],
        },
        profit: {
          count: 0,
          amount: [],
        },
      },
      products: {
        count: 0,
        attributes: [],
        categories: [],
      },
    },
    isLoading,
    isFetching,
  } = useOrderStatisticQuery(
    { filters },
    { options: { placeholderData: prevData => prevData } },
  )

  const onSubmit = (data: any) => {
    setFilters(data)
  }

  const formSchema = useMemo(() => createOrderStatisticFilterSchema(), [])

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultStatisticFormValues(),
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

function createOrderStatisticFilterSchema() {
  return z.object({
    date: z.record(z.date()),
    cashregister: z.array(z.string()).optional(),
    cashregisterAccount: z.array(z.string()).optional(),
  })
}

function getDefaultDateRange() {
  return {
    from: new Date(new Date().setHours(0, 0, 0, 0)),
    to: new Date(new Date().setHours(23, 59, 59, 999)),
  }
}

function getDefaultFilters() {
  return {
    date: getDefaultDateRange(),
    cashregister: [],
    cashregisterAccount: [],
    currency: '',
  }
}

function getDefaultStatisticFormValues() {
  return {
    date: getDefaultDateRange(),
    cashregister: [],
    cashregisterAccount: [],
  }
}
