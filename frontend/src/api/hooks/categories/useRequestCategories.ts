import type { getCategoriesParams } from '@/api/requests'

import { useQuery } from '@tanstack/react-query'
import { getCategories } from '@/api/requests'

export function useRequestCategories(params: getCategoriesParams, settings?: QuerySettings) {
  return useQuery({
    queryKey: [
      'categories',
      'get',
      JSON.stringify(params.pagination),
      JSON.stringify(params.filters),
      JSON.stringify(params.sorters),
    ],
    queryFn: () => getCategories(params),
    ...settings?.options,
    staleTime: 60000,
  })
}
