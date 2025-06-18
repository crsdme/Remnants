import type { getLanguagesParams } from '@/api/types'

import { useQuery } from '@tanstack/react-query'
import { getLanguages } from '@/api/requests'

export function useLanguageQuery(params: getLanguagesParams, settings?: QuerySettings) {
  return useQuery({
    queryKey: ['languages', 'get', params],
    queryFn: () => getLanguages(params),
    staleTime: 60000,
    ...settings?.options,
  })
}
