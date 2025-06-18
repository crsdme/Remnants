import type { getWarehousesParams } from '@/api/types'

import { useQuery } from '@tanstack/react-query'
import { getWarehouses } from '@/api/requests'

export function useWarehouseQuery(params: getWarehousesParams, settings?: QuerySettings) {
  return useQuery({
    queryKey: ['warehouses', 'get', params],
    queryFn: () => getWarehouses(params),
    staleTime: 60000,
    ...settings?.options,
  })
}
