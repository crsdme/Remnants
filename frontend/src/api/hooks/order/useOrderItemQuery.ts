import type { GetOrderItemsRequest } from '@remnant/shared'

import { useQuery } from '@tanstack/react-query'
import { getOrderItems } from '@/api/requests'

const EMPTY_ITEMS: never[] = []

export function useOrderItemQuery(
  params: GetOrderItemsRequest,
  settings?: QuerySettings<typeof getOrderItems>,
) {
  const query = useQuery({
    queryKey: ['orders', 'get', 'items', params],
    queryFn: async () => getOrderItems(params),
    staleTime: 60000,
    ...settings?.options,
  })

  const listData = query.data?.data?.data
  const items = listData?.items ?? EMPTY_ITEMS
  const itemsCount = listData?.pagination?.total ?? 0

  return {
    ...query,
    items,
    itemsCount,
    pagination: listData?.pagination,
  }
}
