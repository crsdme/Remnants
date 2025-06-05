import type { getLanguagesParams } from '@/api/requests'

import { useQuery } from '@tanstack/react-query'
import { getLanguages } from '@/api/requests'

export function useRequestLanguages(params: getLanguagesParams, settings?: QuerySettings) {
  return useQuery({
    queryKey: [
      'languages',
      'get',
      params.pagination,
      params.filters,
      params.sorters,
    ],
    queryFn: () => getLanguages(params),
    ...settings?.options,
    staleTime: 60000,
  })
}
