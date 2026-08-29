import type { GetSiteSyncMappingRequest } from '@remnant/shared'

import { useQuery } from '@tanstack/react-query'
import { getSiteSyncMapping } from '@/api/requests'

export function useSiteSyncMappingQuery(
  params: GetSiteSyncMappingRequest,
  settings?: QuerySettings<typeof getSiteSyncMapping>,
) {
  const query = useQuery({
    queryKey: ['sites', 'sync-mapping', params],
    queryFn: async () => getSiteSyncMapping(params),
    staleTime: 30000,
    ...settings?.options,
  })

  const data = query.data?.data?.data
  const errorCode = query.error && typeof query.error === 'object' && 'response' in query.error
    ? (query.error as { response?: { data?: { error?: { code?: string } } } }).response?.data?.error?.code
    : undefined

  return {
    ...query,
    crmItems: data?.crmItems ?? [],
    siteItems: data?.siteItems ?? [],
    links: data?.links ?? [],
    total: data?.pagination?.total ?? 0,
    errorCode,
  }
}
