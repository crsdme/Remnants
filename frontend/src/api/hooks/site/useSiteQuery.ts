import type { GetSitesRequest } from '@remnant/shared'

import { useQuery } from '@tanstack/react-query'
import { getSites } from '@/api/requests'

export function useSiteQuery(params: GetSitesRequest, settings?: QuerySettings<typeof getSites>) {
  const query = useQuery({
    queryKey: ['sites', 'get', params],
    queryFn: async () => getSites(params),
    staleTime: 60000,
    ...settings?.options,
  })

  const listData = query.data?.data?.data
  const sites = listData?.items ?? []
  const sitesCount = listData?.pagination?.total ?? 0

  return {
    ...query,
    sites,
    sitesCount,
  }
}
