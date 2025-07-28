import type { getWarehousesParams } from '@/api/types'
import { useQueryClient } from '@tanstack/react-query'
import { getWarehouses } from '@/api/requests'

interface LoadOptionsParams {
  query: string
  selectedValue?: string[]
}

interface UseWarehouseOptionsParams {
  defaultFilters?: { ids?: string[] }
  mapFn?: (warehouse: Warehouse) => { value: string, label: string }
}

export function useWarehouseOptions({ defaultFilters, mapFn }: UseWarehouseOptionsParams = {}) {
  const queryClient = useQueryClient()

  return async function loadWarehouseOptions({ query, selectedValue }: LoadOptionsParams): Promise<Warehouse[]> {
    const params: getWarehousesParams = {}
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
      queryKey: ['warehouses', 'get', params],
      queryFn: () => getWarehouses(params),
      staleTime: 60000,
    })

    const warehouses = data?.data?.warehouses || []

    return mapFn ? warehouses.map(mapFn) as unknown as Warehouse[] : warehouses
  }
}
