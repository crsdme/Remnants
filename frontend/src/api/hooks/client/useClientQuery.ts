import type { GetClientsRequest } from '@remnant/shared'

import { useQuery } from '@tanstack/react-query'
import { getClients } from '@/api/requests'

const EMPTY_ITEMS: never[] = []

export function useClientQuery(params: GetClientsRequest, settings?: QuerySettings<typeof getClients>) {
  const query = useQuery({
    queryKey: ['clients', 'get', params],
    queryFn: async () => getClients(params),
    staleTime: 60000,
    ...settings?.options,
  })

  const listData = query.data?.data?.data
  const clients = listData?.items ?? EMPTY_ITEMS
  const clientsCount = listData?.pagination?.total ?? 0

  return {
    ...query,
    clients,
    clientsCount,
    pagination: listData?.pagination,
  }
}
