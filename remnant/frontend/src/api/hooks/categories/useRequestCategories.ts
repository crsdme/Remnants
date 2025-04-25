import type { getCategoriesParams } from '@/api/requests'

import { getCategories } from '@/api/requests'
import { useSuspenseQuery } from '@tanstack/react-query'

export function useRequestCategories(params: getCategoriesParams) {
  return useSuspenseQuery({
    queryKey: ['categories', 'get', params.pagination.current],
    queryFn: () => getCategories(params),
    staleTime: 60000,
  })
}
