import type { GetOrderStatusesRequest } from '@remnant/shared'

import { useQuery } from '@tanstack/react-query'
import { getOrderStatuses } from '@/api/requests'

const EMPTY_ITEMS: never[] = []

export function useOrderStatusQuery(params: GetOrderStatusesRequest, settings?: QuerySettings<typeof getOrderStatuses>) {
  const query = useQuery({
    queryKey: ['order-statuses', 'get', params],
    queryFn: async () => getOrderStatuses(params),
    staleTime: 60000,
    ...settings?.options,
  })

  const listData = query.data?.data?.data
  const orderStatuses = listData?.items ?? EMPTY_ITEMS
  const orderStatusesCount = listData?.pagination?.total ?? 0

  return {
    ...query,
    orderStatuses,
    orderStatusesCount,
  }
}
