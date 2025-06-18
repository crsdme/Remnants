import type { getCategoriesParams } from '@/api/types'

import { useQuery } from '@tanstack/react-query'
import { getCategories } from '@/api/requests'

export function useCategoryQuery(params: getCategoriesParams, settings?: QuerySettings) {
  return useQuery({
    queryKey: ['categories', 'get', params],
    queryFn: () => getCategories(params),
    staleTime: 60000,
    ...settings?.options,
  })
}
