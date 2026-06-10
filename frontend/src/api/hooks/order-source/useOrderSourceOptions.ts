import type { GetOrderSourcesRequest } from '@remnant/shared'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { getOrderSources } from '@/api/requests'

const EMPTY_ITEMS: never[] = []

export function useOrderSourceOptions({ defaultFilters }: { defaultFilters?: GetOrderSourcesRequest['filters'] } = {}) {
  const queryClient = useQueryClient()

  return useCallback(
    async ({ query = '', selectedValue }: { query?: string, selectedValue?: string[] } = {}) => {
      const params: GetOrderSourcesRequest = {
        pagination: { full: true },
        filters: {
          ...(selectedValue ? { ids: selectedValue } : { names: query }),
          ...defaultFilters,
        },
      }

      const response = await queryClient.fetchQuery({
        queryKey: ['order-sources', 'get', params],
        queryFn: async () => getOrderSources(params),
        staleTime: 60000,
      })

      return response?.data?.data?.items ?? EMPTY_ITEMS
    },
    [queryClient],
  )
}

// import type { getOrderSourcesParams } from '@/api/types'
// import { useQueryClient } from '@tanstack/react-query'
// import { getOrderSources } from '@/api/requests'

// interface LoadOptionsParams {
//   query: string
//   selectedValue?: string[]
// }

// interface UseOrderSourceOptionsParams {
//   defaultFilters?: { ids?: string[] }
//   mapFn?: (orderSource: OrderSource) => { value: string, label: string }
// }

// export function useOrderSourceOptions({ defaultFilters, mapFn }: UseOrderSourceOptionsParams = {}) {
//   const queryClient = useQueryClient()

//   return async function loadOrderSourceOptions({ query, selectedValue }: LoadOptionsParams): Promise<OrderSource[]> {
//     const params: getOrderSourcesParams = {}
//     let filters = {}

//     if (query) {
//       filters = {
//         ...(selectedValue ? { ids: selectedValue } : { names: query }),
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

//     const data = await queryClient.fetchQuery({
//       queryKey: ['order-sources', 'get', params],
//       queryFn: () => getOrderSources(params),
//       staleTime: 60000,
//     })

//     const orderSources = data?.data?.orderSources || []

//     return mapFn ? orderSources.map(mapFn) as unknown as OrderSource[] : orderSources
//   }
// }
