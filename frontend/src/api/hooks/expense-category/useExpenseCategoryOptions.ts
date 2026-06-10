import type { ExpenseCategoryDTO, GetExpenseCategoriesRequest } from '@remnant/shared'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { getExpenseCategories } from '@/api/requests'

const EMPTY_ITEMS: never[] = []

export function useExpenseCategoryOptions({ defaultFilters }: { defaultFilters?: GetExpenseCategoriesRequest['filters'] } = {}) {
  const queryClient = useQueryClient()

  return useCallback(
    async ({ query = '', selectedValue }: { query?: string, selectedValue?: string[] } = {}): Promise<ExpenseCategoryDTO[]> => {
      const params: GetExpenseCategoriesRequest = {
        pagination: { full: true },
        filters: {
          ...(selectedValue ? { ids: selectedValue } : { names: query }),
          ...defaultFilters,
        },
      }

      const { data } = await queryClient.fetchQuery({
        queryKey: ['expense-categories', 'get', params],
        queryFn: async () => getExpenseCategories(params),
        staleTime: 60000,
      })

      return data?.data?.items ?? EMPTY_ITEMS
    },
    [queryClient],
  )
}

// import { useQueryClient } from '@tanstack/react-query'
// import { getExpenseCategories } from '@/api/requests/'

// interface DefaultFilters {
//   ids?: string[]
//   names?: string
// }

// interface LoadOptionsParams {
//   query: string
//   selectedValue?: string[]
// }

// export function useExpenseCategoryOptions({ defaultFilters }: { defaultFilters?: DefaultFilters } = {}) {
//   const queryClient = useQueryClient()

//   return async function loadExpenseCategoryOptions({ query, selectedValue }: LoadOptionsParams): Promise<ExpenseCategory[]> {
//     const filters = {
//       ...(selectedValue ? { ids: selectedValue } : { names: query }),
//       ...defaultFilters,
//     }
//     const pagination = { full: true }

//     const data = await queryClient.fetchQuery({
//       queryKey: ['expense-categories', 'get', pagination, filters],
//       queryFn: () => getExpenseCategories({ pagination, filters }),
//       staleTime: 60000,
//     })

//     return data?.data?.expenseCategories || []
//   }
// }
