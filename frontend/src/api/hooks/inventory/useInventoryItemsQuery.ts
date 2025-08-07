import type { getInventoryItemsParams } from '@/api/types'

import { useQuery } from '@tanstack/react-query'
import { getInventoryItems } from '@/api/requests'

export function useInventoryItemsQuery(params: getInventoryItemsParams, settings?: QuerySettings) {
  return useQuery({
    queryKey: ['inventories', 'get', 'items', params],
    queryFn: () => getInventoryItems(params),
    staleTime: 60000,
    ...settings?.options,
  })
}
