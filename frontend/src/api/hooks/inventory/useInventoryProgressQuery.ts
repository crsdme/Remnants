import type { GetInventoryProgressRequest } from '@remnant/shared'

import { useQuery } from '@tanstack/react-query'
import { getInventoryProgress } from '@/api/requests'

export function useInventoryProgressQuery(
  params: GetInventoryProgressRequest,
  settings?: QuerySettings<typeof getInventoryProgress>,
) {
  return useQuery({
    queryKey: ['inventories', 'get', 'progress', params],
    queryFn: async () => getInventoryProgress(params),
    staleTime: 10_000,
    ...settings?.options,
  })
}
