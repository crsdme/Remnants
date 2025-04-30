import type { getLanguagesParams } from '@/api/requests'

import { getLanguages } from '@/api/requests'
import { useSuspenseQuery } from '@tanstack/react-query'

export function useRequestLanguages(params: getLanguagesParams) {
  return useSuspenseQuery({
    queryKey: [
      'languages',
      'get',
      JSON.stringify(params.pagination),
      JSON.stringify(params.filters),
      JSON.stringify(params.sorters),
    ],
    queryFn: () => getLanguages(params),
    staleTime: 60000,
  })
}
