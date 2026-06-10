import type { GetInventoryItemsRequest } from '@remnant/shared'

import { useQuery } from '@tanstack/react-query'
import { getInventoryItems } from '@/api/requests'

export function useInventoryItemsQuery(params: GetInventoryItemsRequest, settings?: QuerySettings<typeof getInventoryItems>) {
  return useQuery({
    queryKey: ['inventories', 'get', 'items', params],
    queryFn: async () => getInventoryItems(params),
    staleTime: 60000,
    ...settings?.options,
  })
}
