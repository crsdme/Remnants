import type { GetExpensesRequest } from '@remnant/shared'

import { useQuery } from '@tanstack/react-query'
import { getExpenses } from '@/api/requests/expense'

const EMPTY_ITEMS: never[] = []

export function useExpenseQuery(params: GetExpensesRequest, settings?: QuerySettings<typeof getExpenses>) {
  const query = useQuery({
    queryKey: ['expenses', 'get', params],
    queryFn: async () => getExpenses(params),
    staleTime: 60000,
    ...settings?.options,
  })

  const listData = query.data?.data?.data
  const expenses = listData?.items ?? EMPTY_ITEMS
  const expensesCount = listData?.pagination?.total ?? 0

  return {
    ...query,
    expenses,
    expensesCount,
  }
}
