import type { getOrderStatusesParams } from '@/api/types'
import { useQueryClient } from '@tanstack/react-query'
import { getOrderStatuses } from '@/api/requests'

interface LoadOptionsParams {
  query: string
  selectedValue?: string[]
}

interface UseOrderStatusOptionsParams {
  defaultFilters?: { ids?: string[] }
  mapFn?: (orderStatus: OrderStatus) => { value: string, label: string }
}

export function useOrderStatusOptions({ defaultFilters, mapFn }: UseOrderStatusOptionsParams = {}) {
  const queryClient = useQueryClient()

  return async function loadOrderStatusOptions({ query, selectedValue }: LoadOptionsParams): Promise<OrderStatus[]> {
    const params: getOrderStatusesParams = {}
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
      queryKey: ['order-statuses', 'get', params],
      queryFn: () => getOrderStatuses(params),
      staleTime: 60000,
    })

    const orderStatuses = data?.data?.orderStatuses || []

    return mapFn ? orderStatuses.map(mapFn) as unknown as OrderStatus[] : orderStatuses
  }
}
