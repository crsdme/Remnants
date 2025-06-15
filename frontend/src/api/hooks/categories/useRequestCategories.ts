import type { getCategoriesParams } from '@/api/requests'

import { useQuery } from '@tanstack/react-query'
import { getCategories } from '@/api/requests'

export function useRequestCategories(params: getCategoriesParams, settings?: QuerySettings) {
  return useQuery({
    queryKey: [
      'categories',
      'get',
      params.pagination,
      params.filters,
      params.sorters,
    ],
    queryFn: () => getCategories(params),
    ...settings?.options,
    staleTime: 60000,
  })
}
