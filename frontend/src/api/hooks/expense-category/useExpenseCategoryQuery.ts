import type { GetExpenseCategoriesRequest } from '@remnant/shared'

import { useQuery } from '@tanstack/react-query'
import { getExpenseCategories } from '@/api/requests/'

const EMPTY_ITEMS: never[] = []

export function useExpenseCategoryQuery(params: GetExpenseCategoriesRequest, settings?: QuerySettings<typeof getExpenseCategories>) {
  const query = useQuery({
    queryKey: ['expense-categories', 'get', params],
    queryFn: async () => getExpenseCategories(params),
    staleTime: 60000,
    ...settings?.options,
  })

  const listData = query.data?.data?.data
  const expenseCategories = listData?.items ?? EMPTY_ITEMS
  const expenseCategoriesCount = listData?.pagination?.total ?? 0

  return {
    ...query,
    expenseCategories,
    expenseCategoriesCount,
  }
}
