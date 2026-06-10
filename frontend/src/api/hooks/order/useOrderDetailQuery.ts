import type { GetOrderDetailsRequest } from '@remnant/shared'

import { useQuery } from '@tanstack/react-query'
import { getOrderDetails } from '@/api/requests'

const EMPTY_ITEMS: never[] = []

export function useOrderDetailQuery(
  params: GetOrderDetailsRequest,
  settings?: QuerySettings<typeof getOrderDetails>,
) {
  const query = useQuery({
    queryKey: ['orders', 'get', params],
    queryFn: async () => getOrderDetails(params),
    staleTime: 60000,
    ...settings?.options,
  })

  const listData = query.data?.data?.data
  const order = listData?.order ?? null
  const items = listData?.items ?? EMPTY_ITEMS
  const payments = listData?.payments ?? EMPTY_ITEMS

  return {
    ...query,
    order,
    items,
    payments,
  }
}
