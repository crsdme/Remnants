import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getWarehouses } from '@/api/requests'

interface LoadOptionsParams {
  query: string
  selectedValue?: string[]
}

export function useWarehouseOptions({ defaultFilters, mapFn }: { defaultFilters?: { ids?: string[] }, mapFn?: (warehouse: Warehouse) => { value: string, label: string } } = {}) {
  const queryClient = useQueryClient()
  const { i18n } = useTranslation()

  return async function loadWarehouseOptions({ query, selectedValue }: LoadOptionsParams): Promise<Warehouse[]> {
    const filters = {
      ...(selectedValue ? { ids: selectedValue } : { names: query }),
      ...defaultFilters,
      active: [true],
      language: i18n.language,
    }

    const data = await queryClient.fetchQuery({
      queryKey: ['warehouses', 'get', { full: true }, filters, undefined],
      queryFn: () => getWarehouses({ pagination: { full: true }, filters }),
      staleTime: 60000,
    })

    const warehouses = data?.data?.warehouses || []

    return mapFn ? warehouses.map(mapFn) as unknown as Warehouse[] : warehouses
  }
}
