import type { getDeliveryServicesParams } from '@/api/types'

import { useQuery } from '@tanstack/react-query'
import { getDeliveryServices } from '@/api/requests'

export function useDeliveryServiceQuery(params: getDeliveryServicesParams, settings?: QuerySettings) {
  return useQuery({
    queryKey: ['delivery-services', 'get', params],
    queryFn: () => getDeliveryServices(params),
    staleTime: 60000,
    ...settings?.options,
  })
}
