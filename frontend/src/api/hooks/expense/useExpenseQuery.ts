import type { getExpensesParams } from '@/api/types'

import { useQuery } from '@tanstack/react-query'
import { getExpenses } from '@/api/requests/expense'

export function useExpenseQuery(params: getExpensesParams, settings?: QuerySettings) {
  return useQuery({
    queryKey: ['expenses', 'get', params],
    queryFn: () => getExpenses(params),
    staleTime: 60000,
    ...settings?.options,
  })
}
