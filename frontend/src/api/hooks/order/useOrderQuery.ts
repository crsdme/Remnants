import type { getOrdersParams } from '@/api/types'

import { useQuery } from '@tanstack/react-query'
import { getOrders } from '@/api/requests'

export function useOrderQuery(params: getOrdersParams, settings?: QuerySettings) {
  return useQuery({
    queryKey: ['orders', 'get', params],
    queryFn: () => getOrders(params),
    staleTime: 60000,
    ...settings?.options,
  })
}
