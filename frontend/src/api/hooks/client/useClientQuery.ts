import type { getClientsParams } from '@/api/types'

import { useQuery } from '@tanstack/react-query'
import { getClients } from '@/api/requests'

export function useClientQuery(params: getClientsParams, settings?: QuerySettings) {
  return useQuery({
    queryKey: ['clients', 'get', params],
    queryFn: () => getClients(params),
    staleTime: 60000,
    ...settings?.options,
  })
}
