import { useQueryClient } from '@tanstack/react-query'
import { getExpenseCategories } from '@/api/requests/expense-categories'

interface DefaultFilters {
  ids?: string[]
  names?: string
}

interface LoadOptionsParams {
  query: string
  selectedValue?: string[]
}

export function useExpenseCategoryOptions({ defaultFilters }: { defaultFilters?: DefaultFilters } = {}) {
  const queryClient = useQueryClient()

  return async function loadExpenseCategoryOptions({ query, selectedValue }: LoadOptionsParams): Promise<ExpenseCategory[]> {
    const filters = {
      ...(selectedValue ? { ids: selectedValue } : { names: query }),
      ...defaultFilters,
    }
    const pagination = { full: true }

    const data = await queryClient.fetchQuery({
      queryKey: ['expense-categories', 'get', pagination, filters],
      queryFn: () => getExpenseCategories({ pagination, filters }),
      staleTime: 60000,
    })

    return data?.data?.expenseCategories || []
  }
}
