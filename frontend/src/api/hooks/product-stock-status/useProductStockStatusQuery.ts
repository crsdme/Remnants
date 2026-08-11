import type { GetProductStockStatusesRequest } from '@remnant/shared'

import { useQuery } from '@tanstack/react-query'
import { getProductStockStatuses } from '@/api/requests'

const EMPTY_ITEMS: never[] = []

export function useProductStockStatusQuery(params: GetProductStockStatusesRequest, settings?: QuerySettings<typeof getProductStockStatuses>) {
  const query = useQuery({
    queryKey: ['product-stock-statuses', 'get', params],
    queryFn: async () => getProductStockStatuses(params),
    staleTime: 60000,
    ...settings?.options,
  })

  const listData = query.data?.data?.data
  const productStockStatuses = listData?.items ?? EMPTY_ITEMS
  const productStockStatusesCount = listData?.pagination?.total ?? 0

  return {
    ...query,
    productStockStatuses,
    productStockStatusesCount,
  }
}
