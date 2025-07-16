import type { getOrderStatusesParams } from '@/api/types'

import { useQuery } from '@tanstack/react-query'
import { getOrderStatuses } from '@/api/requests'

export function useOrderStatusQuery(params: getOrderStatusesParams, settings?: QuerySettings) {
  return useQuery({
    queryKey: ['order-statuses', 'get', params],
    queryFn: () => getOrderStatuses(params),
    staleTime: 60000,
    ...settings?.options,
  })
}
