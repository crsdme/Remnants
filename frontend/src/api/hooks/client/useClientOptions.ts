import type { ClientDTO, GetClientsRequest } from '@remnant/shared'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { getClients } from '@/api/requests'

const EMPTY_ITEMS: never[] = []

export function useClientOptions({ defaultFilters }: { defaultFilters?: GetClientsRequest['filters'] } = {}) {
  const queryClient = useQueryClient()

  return useCallback(
    async ({ query = '', selectedValue }: { query?: string, selectedValue?: string[] } = {}): Promise<ClientDTO[]> => {
      const params: GetClientsRequest = {
        pagination: { full: true },
        filters: {
          ...(selectedValue ? { ids: selectedValue } : { search: query }),
          ...defaultFilters,
        },
      }

      const { data } = await queryClient.fetchQuery({
        queryKey: ['clients', 'get', params],
        queryFn: async () => getClients(params),
        staleTime: 60000,
      })

      return data?.data?.items ?? EMPTY_ITEMS
    },
    [queryClient],
  )
}

// import type { ClientDTO, GetClientsRequest } from '@remnant/shared'
// import { useQueryClient } from '@tanstack/react-query'
// import { getClients } from '@/api/requests'

// interface LoadOptionsParams {
//   query: string
//   selectedValue?: string[]
// }

// interface UseClientOptionsParams {
//   defaultFilters?: { ids?: string[] }
//   mapFn?: (client: ClientDTO) => { value: string, label: string }
// }

// export function useClientOptions({ defaultFilters, mapFn }: UseClientOptionsParams = {}) {
//   const queryClient = useQueryClient()

//   return async function loadClientOptions({ query, selectedValue }: LoadOptionsParams): Promise<Client[]> {
//     const params: getClientsParams = {}
//     let filters = {}

//     if (query || selectedValue) {
//       filters = {
//         ...(selectedValue ? { ids: selectedValue } : { search: query }),
//       }
//     }

//     if (defaultFilters) {
//       filters = {
//         ...filters,
//         ...defaultFilters,
//       }
//     }

//     if (Object.keys(filters).length > 0) {
//       params.filters = filters
//     }

//     const { data } = await queryClient.fetchQuery({
//       queryKey: ['clients', 'get', params],
//       queryFn: () => getClients(params),
//       staleTime: 60000,
//     })

//     const clients = data?.data?.items || []

//     return mapFn ? clients.map(mapFn) as unknown as Client[] : clients
//   }
// }
