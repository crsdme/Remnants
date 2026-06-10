import type { GetDeliveryServicesRequest } from '@remnant/shared'

import { useQuery } from '@tanstack/react-query'
import { getDeliveryServices } from '@/api/requests'

const EMPTY_ITEMS: never[] = []

export function useDeliveryServiceQuery(params: GetDeliveryServicesRequest, settings?: QuerySettings<typeof getDeliveryServices>) {
  const query = useQuery({
    queryKey: ['delivery-services', 'get', params],
    queryFn: async () => getDeliveryServices(params),
    staleTime: 60000,
    ...settings?.options,
  })

  const listData = query.data?.data?.data
  const deliveryServices = listData?.items ?? EMPTY_ITEMS
  const deliveryServicesCount = listData?.pagination?.total ?? 0

  return {
    ...query,
    deliveryServices,
    deliveryServicesCount,
  }
}
