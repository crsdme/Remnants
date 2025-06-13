import type { getWarehousesParams } from '@/api/requests'

import { useQuery } from '@tanstack/react-query'
import { getWarehouses } from '@/api/requests'

export function useRequestWarehouses(params: getWarehousesParams, settings?: QuerySettings) {
  return useQuery({
    queryKey: [
      'warehouses',
      'get',
      params.pagination,
      params.filters,
      params.sorters,
    ],
    queryFn: () => getWarehouses(params),
    ...settings?.options,
    staleTime: 60000,
  })
}
