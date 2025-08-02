import type { getSitesParams } from '@/api/types'

import { useQuery } from '@tanstack/react-query'
import { getSites } from '@/api/requests'

export function useSiteQuery(params: getSitesParams, settings?: QuerySettings) {
  return useQuery({
    queryKey: ['sites', 'get', params],
    queryFn: () => getSites(params),
    staleTime: 60000,
    ...settings?.options,
  })
}
