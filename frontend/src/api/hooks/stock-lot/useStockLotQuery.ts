import type { GetStockLotsRequest } from '@remnant/shared'

import { useQuery } from '@tanstack/react-query'
import { getStockLots } from '@/api/requests'

const EMPTY_ITEMS: never[] = []

export function useStockLotQuery(params: GetStockLotsRequest, settings?: QuerySettings<typeof getStockLots>) {
  const query = useQuery({
    queryKey: ['stock-lots', 'get', params],
    queryFn: async () => getStockLots(params),
    staleTime: 60000,
    ...settings?.options,
  })

  const listData = query.data?.data?.data
  const stockLots = listData?.items ?? EMPTY_ITEMS
  const stockLotsCount = listData?.pagination?.total ?? 0

  return {
    ...query,
    stockLots,
    stockLotsCount,
  }
}
