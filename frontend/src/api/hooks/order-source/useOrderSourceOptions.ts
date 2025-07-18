import type { getOrderSourcesParams } from '@/api/types'
import { useQueryClient } from '@tanstack/react-query'
import { getOrderSources } from '@/api/requests'

interface LoadOptionsParams {
  query: string
  selectedValue?: string[]
}

interface UseOrderSourceOptionsParams {
  defaultFilters?: { ids?: string[] }
  mapFn?: (orderSource: OrderSource) => { value: string, label: string }
}

export function useOrderSourceOptions({ defaultFilters, mapFn }: UseOrderSourceOptionsParams = {}) {
  const queryClient = useQueryClient()

  return async function loadOrderSourceOptions({ query, selectedValue }: LoadOptionsParams): Promise<OrderSource[]> {
    const params: getOrderSourcesParams = {}
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
      queryKey: ['order-sources', 'get', params],
      queryFn: () => getOrderSources(params),
      staleTime: 60000,
    })

    const orderSources = data?.data?.orderSources || []

    return mapFn ? orderSources.map(mapFn) as unknown as OrderSource[] : orderSources
  }
}
