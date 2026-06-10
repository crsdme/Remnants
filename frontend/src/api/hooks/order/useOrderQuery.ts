import type { GetOrdersRequest } from '@remnant/shared'

import { useQuery } from '@tanstack/react-query'
import { getOrders } from '@/api/requests'

const EMPTY_ITEMS: never[] = []

export function useOrderQuery(
  params: GetOrdersRequest,
  settings?: QuerySettings<typeof getOrders>,
) {
  const query = useQuery({
    queryKey: ['orders', 'get', params],
    queryFn: async () => getOrders(params),
    staleTime: 60000,
    ...settings?.options,
  })

  const listData = query.data?.data?.data
  const orders = listData?.items ?? EMPTY_ITEMS
  const ordersCount = listData?.pagination?.total ?? 0

  return {
    ...query,
    orders,
    ordersCount,
    pagination: listData?.pagination,
  }
}
