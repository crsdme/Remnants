import type { getLanguagesParams } from '@/api/requests'

import { getLanguages } from '@/api/requests'
import { useSuspenseQuery } from '@tanstack/react-query'

export function useRequestLanguages(params: getLanguagesParams) {
  return useSuspenseQuery({
    queryKey: ['languages', 'get', params.pagination.current],
    queryFn: () => getLanguages(params),
    staleTime: 60000,
  })
}
