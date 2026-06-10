import type { GetOrderSourcesRequest } from '@remnant/shared'

import { useQuery } from '@tanstack/react-query'
import { getOrderSources } from '@/api/requests'

const EMPTY_ITEMS: never[] = []

export function useOrderSourceQuery(params: GetOrderSourcesRequest, settings?: QuerySettings<typeof getOrderSources>) {
  const query = useQuery({
    queryKey: ['order-sources', 'get', params],
    queryFn: async () => getOrderSources(params),
    staleTime: 60000,
    ...settings?.options,
  })

  const listData = query.data?.data?.data
  const orderSources = listData?.items ?? EMPTY_ITEMS
  const orderSourcesCount = listData?.pagination?.total ?? 0

  return {
    ...query,
    orderSources,
    orderSourcesCount,
  }
}
