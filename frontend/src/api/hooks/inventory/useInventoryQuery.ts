import type { GetInventoriesRequest } from '@remnant/shared'

import { useQuery } from '@tanstack/react-query'
import { getInventories } from '@/api/requests'

const EMPTY_ITEMS: never[] = []

export function useInventoryQuery(params: GetInventoriesRequest, settings?: QuerySettings<typeof getInventories>) {
  const query = useQuery({
    queryKey: ['inventories', 'get', params],
    queryFn: async () => getInventories(params),
    staleTime: 60000,
    ...settings?.options,
  })

  const listData = query.data?.data?.data
  const inventories = listData?.items ?? EMPTY_ITEMS
  const inventoriesCount = listData?.pagination?.total ?? 0

  return {
    ...query,
    inventories,
    inventoriesCount,
  }
}
