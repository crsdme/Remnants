import type { getInventoriesParams } from '@/api/types'

import { useQuery } from '@tanstack/react-query'
import { getInventories } from '@/api/requests'

export function useInventoryQuery(params: getInventoriesParams, settings?: QuerySettings) {
  return useQuery({
    queryKey: ['inventories', 'get', params],
    queryFn: () => getInventories(params),
    staleTime: 60000,
    ...settings?.options,
  })
}
