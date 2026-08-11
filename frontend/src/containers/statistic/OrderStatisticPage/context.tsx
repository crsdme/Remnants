import type { StatisticsDTO } from '@remnant/shared'
import type { ReactNode } from 'react'
import type { DateRange } from 'react-day-picker'
import type { Resolver } from 'react-hook-form'
import type { FilterSearchParams } from '@/utils/hooks'

import { zodResolver } from '@hookform/resolvers/zod'
import { createContext, useCallback, useContext, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'

import { z } from 'zod'
import {
  useOrderStatisticQuery,
} from '@/api/hooks'
import {
  parseQueryCsv,
  parseQueryDate,
  setQueryParam,
  setQueryParamCsv,
  useListQueryState,
} from '@/utils/hooks'

const emptyStatistics: StatisticsDTO = {
  range: {},
  orders: {
    count: 0,
    amount: [],
    paid: { count: 0, amount: [] },
    unpaid: { count: 0, amount: [] },
  },
  payments: {
    count: 0,
    amount: [],
    income: { count: 0, amount: [] },
    expense: { count: 0, amount: [], categories: [] },
    profit: { count: 0, amount: [] },
  },
  products: {
    count: 0,
    items: [],
  },
  series: [],
}

interface OrderStatisticFilters extends Record<string, unknown> {
  date: DateRange
  cashregister: string[]
  cashregisterAccount: string[]
}

interface OrderStatisticContextType {
  isLoading: boolean
  isFetching: boolean
  form: ReturnType<typeof useForm<OrderStatisticFormValues>>
  statistics: StatisticsDTO
  onSubmit: (data: OrderStatisticFormValues) => void
}

interface OrderStatisticFormValues {
  date: DateRange
  cashregister?: string[]
  cashregisterAccount?: string[]
}

const OrderStatisticContext = createContext<OrderStatisticContextType | undefined>(undefined)

export function OrderStatisticProvider({ children }: { children: ReactNode }) {
  const defaultFilters = useMemo(() => getDefaultFilters(), [])

  const readFilters = useCallback((params: FilterSearchParams): Partial<OrderStatisticFilters> => {
    const from = parseQueryDate(params.get('dateFrom'))
    const to = parseQueryDate(params.get('dateTo'))
    return {
      date: {
        from: from ?? defaultFilters.date.from,
        to: to ?? defaultFilters.date.to,
      },
      cashregister: parseQueryCsv(params.get('cashregister')),
      cashregisterAccount: parseQueryCsv(params.get('cashregisterAccount')),
    }
  }, [defaultFilters])

  const writeFilters = useCallback((
    params: FilterSearchParams,
    next: Partial<OrderStatisticFilters>,
  ) => {
    setQueryParam(params, 'dateFrom', next.date?.from?.toISOString() ?? null)
    setQueryParam(params, 'dateTo', next.date?.to?.toISOString() ?? null)
    setQueryParamCsv(params, 'cashregister', next.cashregister ?? [])
    setQueryParamCsv(params, 'cashregisterAccount', next.cashregisterAccount ?? [])
  }, [])

  const listQueryOptions = useMemo(() => ({
    defaults: { filters: defaultFilters },
    readFilters,
    writeFilters,
  }), [defaultFilters, readFilters, writeFilters])

  const { filters, setFilters } = useListQueryState<OrderStatisticFilters>(listQueryOptions)

  const {
    statistics,
    isLoading,
    isFetching,
  } = useOrderStatisticQuery(
    { filters },
    { options: { placeholderData: prevData => prevData } },
  )

  const onSubmit = useCallback((data: OrderStatisticFormValues) => {
    setFilters({
      date: data.date,
      cashregister: data.cashregister ?? [],
      cashregisterAccount: data.cashregisterAccount ?? [],
    })
  }, [setFilters])

  const formSchema = useMemo(() => createOrderStatisticFilterSchema(), [])

  const form = useForm<OrderStatisticFormValues>({
    resolver: zodResolver(formSchema) as Resolver<OrderStatisticFormValues>,
    defaultValues: {
      date: filters.date,
      cashregister: filters.cashregister,
      cashregisterAccount: filters.cashregisterAccount,
    },
  })

  const filtersKey = [
    filters.date.from?.toISOString() ?? '',
    filters.date.to?.toISOString() ?? '',
    filters.cashregister.join(','),
    filters.cashregisterAccount.join(','),
  ].join('|')

  useEffect(() => {
    form.reset({
      date: filters.date,
      cashregister: filters.cashregister,
      cashregisterAccount: filters.cashregisterAccount,
    })
  }, [filtersKey, form, filters])

  const value: OrderStatisticContextType = useMemo(
    () => ({
      isLoading,
      isFetching,
      form,
      onSubmit,
      statistics: statistics ?? emptyStatistics,
    }),
    [isLoading, isFetching, form, onSubmit, statistics],
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
    date: z.object({
      from: z.date().optional(),
      to: z.date().optional(),
    }),
    cashregister: z.array(z.string()).optional(),
    cashregisterAccount: z.array(z.string()).optional(),
  })
}

function getDefaultDateRange(): DateRange {
  return {
    from: new Date(new Date().setHours(0, 0, 0, 0)),
    to: new Date(new Date().setHours(23, 59, 59, 999)),
  }
}

function getDefaultFilters(): OrderStatisticFilters {
  return {
    date: getDefaultDateRange(),
    cashregister: [],
    cashregisterAccount: [],
  }
}
