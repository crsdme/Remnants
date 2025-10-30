import type { getSuppliersParams } from '@/api/types'
import { useQueryClient } from '@tanstack/react-query'
import { getSuppliers } from '@/api/requests'

interface LoadOptionsParams {
  query: string
  selectedValue?: string[]
}

interface UseSupplierOptionsParams {
  defaultFilters?: { ids?: string[] }
  mapFn?: (supplier: Supplier) => { value: string, label: string }
}

export function useSupplierOptions({ defaultFilters, mapFn }: UseSupplierOptionsParams = {}) {
  const queryClient = useQueryClient()

  return async function loadSupplierOptions({ query, selectedValue }: LoadOptionsParams): Promise<Supplier[]> {
    const params: getSuppliersParams = {}
    let filters = {}

    if (query || selectedValue) {
      filters = {
        ...(selectedValue ? { ids: selectedValue } : { search: query }),
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
      queryKey: ['suppliers', 'get', params],
      queryFn: () => getSuppliers(params),
      staleTime: 60000,
    })

    const suppliers = data?.data?.suppliers || []

    return mapFn ? suppliers.map(mapFn) as unknown as Supplier[] : suppliers
  }
}
