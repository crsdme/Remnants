import type { getOrderStatisticParams } from '@/api/types'

import { useQuery } from '@tanstack/react-query'
import { getOrderStatistic } from '@/api/requests'

export function useOrderStatisticQuery(params: getOrderStatisticParams, settings?: QuerySettings) {
  return useQuery({
    queryKey: ['statistics', 'orders', 'get', params],
    queryFn: () => getOrderStatistic(params),
    staleTime: 60000,
    ...settings?.options,
  })
}
