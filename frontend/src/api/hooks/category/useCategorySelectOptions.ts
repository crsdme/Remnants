import type { CategoryDTO, GetCategoriesRequest } from '@remnant/shared'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { getCategories } from '@/api/requests'

const EMPTY_ITEMS: never[] = []

interface UseCategorySelectOptionsParams {
  defaultFilters?: GetCategoriesRequest['filters']
}

export function useCategorySelectOptions(
  { defaultFilters }: UseCategorySelectOptionsParams = {},
) {
  const queryClient = useQueryClient()

  const fetchCategories = useCallback(
    async (filters: GetCategoriesRequest['filters']): Promise<CategoryDTO[]> => {
      const params: GetCategoriesRequest = {
        pagination: { full: true },
        filters: {
          ...filters,
          ...defaultFilters,
          active: [true],
        },
      }

      const { data } = await queryClient.fetchQuery({
        queryKey: ['categories', 'get', params],
        queryFn: async () => getCategories(params),
        staleTime: 60000,
      })

      return data?.data?.items ?? EMPTY_ITEMS
    },
    [queryClient, defaultFilters],
  )

  const loadSearchOptions = useCallback(
    async (query: string) => fetchCategories({ names: query }),
    [fetchCategories],
  )

  const loadSelectedOptions = useCallback(
    async (ids: string[]) => fetchCategories({ ids }),
    [fetchCategories],
  )

  return { loadSearchOptions, loadSelectedOptions }
}
