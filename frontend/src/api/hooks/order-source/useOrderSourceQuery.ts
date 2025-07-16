import type { getOrderSourcesParams } from '@/api/types'

import { useQuery } from '@tanstack/react-query'
import { getOrderSources } from '@/api/requests'

export function useOrderSourceQuery(params: getOrderSourcesParams, settings?: QuerySettings) {
  return useQuery({
    queryKey: ['order-sources', 'get', params],
    queryFn: () => getOrderSources(params),
    staleTime: 60000,
    ...settings?.options,
  })
}
