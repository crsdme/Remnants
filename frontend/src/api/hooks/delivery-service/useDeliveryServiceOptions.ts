import type { getDeliveryServicesParams } from '@/api/types'
import { useQueryClient } from '@tanstack/react-query'
import { getDeliveryServices } from '@/api/requests'

interface LoadOptionsParams {
  query: string
  selectedValue?: string[]
}

interface UseDeliveryServiceOptionsParams {
  defaultFilters?: { ids?: string[] }
  mapFn?: (deliveryService: DeliveryService) => { value: string, label: string }
}

export function useDeliveryServiceOptions({ defaultFilters, mapFn }: UseDeliveryServiceOptionsParams = {}) {
  const queryClient = useQueryClient()

  return async function loadDeliveryServiceOptions({ query, selectedValue }: LoadOptionsParams): Promise<DeliveryService[]> {
    const params: getDeliveryServicesParams = {}
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
      queryKey: ['delivery-services', 'get', params],
      queryFn: () => getDeliveryServices(params),
      staleTime: 60000,
    })

    const deliveryServices = data?.data?.deliveryServices || []

    return mapFn ? deliveryServices.map(mapFn) as unknown as DeliveryService[] : deliveryServices
  }
}
