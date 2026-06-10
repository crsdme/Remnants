import type { DeliveryServiceDTO, GetDeliveryServicesRequest } from '@remnant/shared'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { getDeliveryServices } from '@/api/requests'

const EMPTY_ITEMS: never[] = []

export function useDeliveryServiceOptions({ defaultFilters }: { defaultFilters?: GetDeliveryServicesRequest['filters'] } = {}) {
  const queryClient = useQueryClient()

  return useCallback(
    async ({ query = '', selectedValue }: { query?: string, selectedValue?: string[] } = {}): Promise<DeliveryServiceDTO[]> => {
      const params: GetDeliveryServicesRequest = {
        pagination: { full: true },
        filters: {
          ...(selectedValue ? { ids: selectedValue } : { names: query }),
          ...defaultFilters,
        },
      }

      const { data } = await queryClient.fetchQuery({
        queryKey: ['delivery-services', 'get', params],
        queryFn: async () => getDeliveryServices(params),
        staleTime: 60000,
      })

      return data?.data?.items ?? EMPTY_ITEMS
    },
    [queryClient],
  )
}

// import type { getDeliveryServicesParams } from '@/api/types'
// import { useQueryClient } from '@tanstack/react-query'
// import { getDeliveryServices } from '@/api/requests'

// interface LoadOptionsParams {
//   query: string
//   selectedValue?: string[]
// }

// interface UseDeliveryServiceOptionsParams {
//   defaultFilters?: { ids?: string[] }
//   mapFn?: (deliveryService: DeliveryService) => { value: string, label: string }
// }

// export function useDeliveryServiceOptions({ defaultFilters, mapFn }: UseDeliveryServiceOptionsParams = {}) {
//   const queryClient = useQueryClient()

//   return async function loadDeliveryServiceOptions({ query, selectedValue }: LoadOptionsParams): Promise<DeliveryService[]> {
//     const params: getDeliveryServicesParams = {}
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
//       queryKey: ['delivery-services', 'get', params],
//       queryFn: () => getDeliveryServices(params),
//       staleTime: 60000,
//     })

//     const deliveryServices = data?.data?.deliveryServices || []

//     return mapFn ? deliveryServices.map(mapFn) as unknown as DeliveryService[] : deliveryServices
//   }
// }
