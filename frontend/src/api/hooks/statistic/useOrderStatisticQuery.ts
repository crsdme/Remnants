import type { GetOrderStatisticRequest } from '@remnant/shared'

import { useQuery } from '@tanstack/react-query'
import { getOrderStatistic } from '@/api/requests'

export function useOrderStatisticQuery(params: GetOrderStatisticRequest, settings?: QuerySettings<typeof getOrderStatistic>) {
  const query = useQuery({
    queryKey: ['statistics', 'orders', 'get', params],
    queryFn: async () => getOrderStatistic(params),
    staleTime: 60000,
    ...settings?.options,
  })

  const statistics = query.data?.data || null

  return {
    ...query,
    statistics,
  }
}
