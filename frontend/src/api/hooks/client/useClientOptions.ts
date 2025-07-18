import type { getClientsParams } from '@/api/types'
import { useQueryClient } from '@tanstack/react-query'
import { getClients } from '@/api/requests'

interface LoadOptionsParams {
  query: string
  selectedValue?: string[]
}

interface UseClientOptionsParams {
  defaultFilters?: { ids?: string[] }
  mapFn?: (client: Client) => { value: string, label: string }
}

export function useClientOptions({ defaultFilters, mapFn }: UseClientOptionsParams = {}) {
  const queryClient = useQueryClient()

  return async function loadClientOptions({ query, selectedValue }: LoadOptionsParams): Promise<Client[]> {
    const params: getClientsParams = {}
    let filters = {}

    if (query) {
      filters = {
        ...(selectedValue ? { ids: selectedValue } : { names: query }),
      }
    }

    if (defaultFilters) {
      filters = {
        ...filters,
        ...defaultFilters,
      }
    }

    if (Object.keys(filters).length > 0) {
      params.filters = filters
    }

    const data = await queryClient.fetchQuery({
      queryKey: ['clients', 'get', params],
      queryFn: () => getClients(params),
      staleTime: 60000,
    })

    const clients = data?.data?.clients || []

    return mapFn ? clients.map(mapFn) as unknown as Client[] : clients
  }
}
