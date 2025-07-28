import type { getExpenseCategoriesParams } from '@/api/types'

import { useQuery } from '@tanstack/react-query'
import { getExpenseCategories } from '@/api/requests/expense-categories'

export function useExpenseCategoryQuery(params: getExpenseCategoriesParams, settings?: QuerySettings) {
  return useQuery({
    queryKey: ['expense-categories', 'get', params],
    queryFn: () => getExpenseCategories(params),
    staleTime: 60000,
    ...settings?.options,
  })
}
