import type { getDeliveryStatusesParams } from '@/api/types'

import { useQuery } from '@tanstack/react-query'
import { getDeliveryStatuses } from '@/api/requests'

export function useDeliveryStatusQuery(params: getDeliveryStatusesParams, settings?: QuerySettings) {
  return useQuery({
    queryKey: ['delivery-statuses', 'get', params],
    queryFn: () => getDeliveryStatuses(params),
    staleTime: 60000,
    ...settings?.options,
  })
}
